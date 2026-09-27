"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileVideo,
  Gauge,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COLD_START_HINT_AFTER_MS,
  MAX_CONCURRENT_JOBS_PER_MODEL,
  MAX_DURATION_SECONDS,
  MAX_UPLOAD_BYTES,
  MODEL_PRESETS,
  OUTPUT_URL_TTL_SECONDS,
  POLL_INTERVAL_MS,
  RATE_LIMIT_PER_MINUTE,
  RESOLUTION_PRESETS,
  SUPPORTED_EXTENSIONS,
  contentTypeFor,
  formatBytes,
  formatDuration,
  isDownscale,
  isJobFailure,
  isJobSuccess,
  isSupportedFilename,
  predictOutputSize,
  type VsrProJobCreated,
  type VsrProJobState,
  type VsrProModel,
  type VsrProResolution,
  type VsrProUploadTicket,
} from "@/lib/vsrpro";

/* -------------------------------------------------------------------------- */
/* Local state                                                                 */
/* -------------------------------------------------------------------------- */

type Phase =
  | "idle"
  | "probing"
  | "ready"
  | "requesting-upload"
  | "uploading"
  | "submitting"
  | "tracking"
  | "failed";

interface SourceMeta {
  file: File;
  width: number;
  height: number;
  /** Seconds, as reported by the browser's demuxer. */
  duration: number;
  /** The single content_type used for both /v1/uploads and the PUT. */
  contentType: string;
  objectUrl: string;
}

interface FailureState {
  message: string;
  hint?: string;
}

/** Enough to resume polling across a page refresh. No presigned URLs. */
interface ResumeRecord {
  jobId: string;
  filename: string;
  submittedAt: number;
}

const RESUME_KEY = "vsrpro-console:last-job";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Turn a gateway status code into something actionable. §6 lists what each
 * one means; the hints below say what to actually do about it.
 */
function explainStatus(status: number, detail?: string): FailureState {
  const message = detail || `Request failed with HTTP ${status}.`;
  switch (status) {
    case 400:
      return {
        message,
        hint: "请求体有问题——不支持的扩展名、无法识别的 resolution/model,或传了非空的 model_parameters。",
      };
    case 401:
      return {
        message,
        hint: "要么本站的登录会话过期了(重新登录),要么网关拒绝了我们的 API Key——检查部署环境里的 VSRPRO_API_KEY 是否缺失、写错或已被吊销。",
      };
    case 403:
      return {
        message,
        hint: "要么当前账户不是 admin,要么这个 input_key 不属于网关上的该账户(重新走一遍上传流程拿新的 input_key)。",
      };
    case 404:
      return {
        message,
        hint: "资源不存在。任务可能已超出保留期,或者输入对象还没上传成功。",
      };
    case 413:
      return {
        message,
        hint: `输入超过了 ${formatBytes(MAX_UPLOAD_BYTES)} 上限。先压缩或分段。`,
      };
    case 429:
      return {
        message,
        hint: `触发限流(${RATE_LIMIT_PER_MINUTE} 次/分钟)。退避后重试。`,
      };
    case 502:
      return {
        message,
        hint: "上游处理出错。稍后重试;如果稳定复现,就是网关侧的问题。",
      };
    case 503:
      return {
        message,
        hint: "请求的 model 没有在这个网关上配置。注意它不会静默退回默认流水线——那样等于按默认价格给一个明确要求不用它的请求计费。",
      };
    default:
      return { message };
  }
}

async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { detail?: string; error?: string };
    return body.detail || body.error;
  } catch {
    return undefined;
  }
}

/**
 * Probe dimensions and duration locally so the pre-flight checks and the
 * predicted output size can run before a single byte is uploaded.
 */
function probeVideo(file: File): Promise<SourceMeta> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        file,
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        contentType: contentTypeFor(file.name, file.type),
        objectUrl,
      });
    };
    video.onerror = () => {
      // .mkv and some .avi codecs won't decode in-browser. That's fine — the
      // worker demuxes server-side, we just lose the local preview and the
      // size prediction.
      resolve({
        file,
        width: 0,
        height: 0,
        duration: 0,
        contentType: contentTypeFor(file.name, file.type),
        objectUrl,
      });
    };
    video.src = objectUrl;
    setTimeout(() => reject(new Error("Timed out reading video metadata.")), 15_000);
  });
}

/**
 * PUT the file straight to object storage. Uses XHR because fetch gives no
 * upload-progress events, and a 2 GiB upload with no feedback is unusable.
 */
function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    // §3.2: this must match the content_type declared to /v1/uploads.
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Object storage rejected the upload (HTTP ${xhr.status}).`));
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "上传请求在到达对象存储前就失败了。通常是存储桶的 CORS 没放行本站 origin 的 PUT,或者 upload_url 已过期。"
        )
      );
    xhr.onabort = () => reject(new Error("Upload aborted."));
    xhr.send(file);
  });
}

/* -------------------------------------------------------------------------- */
/* Presentational bits                                                         */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  step,
  children,
  muted,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-opacity sm:p-7 ${
        muted ? "opacity-45" : ""
      }`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 font-mono text-xs text-white/70">
          {step}
        </span>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-xs text-white/45">{label}</span>
      <span className="font-mono text-xs text-white/85">{value}</span>
    </div>
  );
}

function Note({
  tone,
  icon: Icon,
  children,
}: {
  tone: "info" | "warn" | "danger";
  icon: typeof Info;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-sky-400/25 bg-sky-500/10 text-sky-100/90",
    warn: "border-amber-400/25 bg-amber-500/10 text-amber-100/90",
    danger: "border-rose-400/25 bg-rose-500/10 text-rose-100/90",
  }[tone];
  return (
    <div className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Console                                                                     */
/* -------------------------------------------------------------------------- */

export function VsrProConsole({ configured }: { configured: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [source, setSource] = useState<SourceMeta | null>(null);
  const [resolution, setResolution] = useState<VsrProResolution>("4k");
  const [model, setModel] = useState<VsrProModel>("vsr-combined");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [failure, setFailure] = useState<FailureState | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<VsrProJobState | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [outputExpiresAt, setOutputExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [health, setHealth] = useState<"unknown" | "checking" | "up" | "down">(
    "unknown"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollDelay = useRef(POLL_INTERVAL_MS);
  /** Set when a terminal state (or a reset) should stop the loop re-arming. */
  const pollCancelled = useRef(false);

  /* ---------------------------------------------------------------------- */
  /* Derived                                                                 */
  /* ---------------------------------------------------------------------- */

  const preset = RESOLUTION_PRESETS.find((p) => p.value === resolution)!;
  const modelPreset = MODEL_PRESETS.find((m) => m.value === model)!;

  const predicted = useMemo(() => {
    if (!source || !source.width || !source.height) return null;
    return predictOutputSize(source, preset.shortEdge);
  }, [source, preset.shortEdge]);

  const willDownscale = useMemo(() => {
    if (!source || !source.width || !source.height) return false;
    return isDownscale(source, preset.shortEdge);
  }, [source, preset.shortEdge]);

  const preflight = useMemo(() => {
    if (!source) return [] as string[];
    const problems: string[] = [];
    if (!isSupportedFilename(source.file.name)) {
      problems.push(
        `扩展名不受支持。允许:${SUPPORTED_EXTENSIONS.join("、")}`
      );
    }
    if (source.file.size > MAX_UPLOAD_BYTES) {
      problems.push(
        `文件 ${formatBytes(source.file.size)} 超过 ${formatBytes(
          MAX_UPLOAD_BYTES
        )} 上限——网关会返回 413。`
      );
    }
    if (source.duration > MAX_DURATION_SECONDS) {
      problems.push(
        `时长 ${formatDuration(source.duration)} 超过 ${MAX_DURATION_SECONDS} 秒上限——任务会带 error 失败。`
      );
    }
    return problems;
  }, [source]);

  const elapsedMs = submittedAt ? now - submittedAt : 0;
  const succeeded = job ? isJobSuccess(job) : false;

  const busy =
    phase === "probing" ||
    phase === "requesting-upload" ||
    phase === "uploading" ||
    phase === "submitting" ||
    // A finished job leaves us in "tracking" so the result stays on screen;
    // that isn't busy, the controls should come back.
    (phase === "tracking" && !succeeded);

  /* ---------------------------------------------------------------------- */
  /* Ticking clock — only while something is in flight                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (phase !== "tracking" && !outputExpiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [phase, outputExpiresAt]);

  /* ---------------------------------------------------------------------- */
  /* Polling                                                                 */
  /* ---------------------------------------------------------------------- */

  const stopPolling = useCallback(() => {
    pollCancelled.current = true;
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const pollOnce = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(`/api/vsrpro/jobs/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });

      if (response.status === 429) {
        // §6: back off exponentially rather than hammering.
        pollDelay.current = Math.min(pollDelay.current * 2, 60_000);
        return;
      }
      if (!response.ok) {
        const detail = await readDetail(response);
        stopPolling();
        setFailure(explainStatus(response.status, detail));
        setPhase("failed");
        // Drop the resume record too, so a stale job id doesn't resurface the
        // same error on every refresh.
        window.localStorage.removeItem(RESUME_KEY);
        return;
      }

      pollDelay.current = POLL_INTERVAL_MS;
      const next = (await response.json()) as VsrProJobState;
      setJob(next);

      if (isJobSuccess(next)) {
        stopPolling();
        setPhase("tracking");
        if (next.output_expires_in) {
          setOutputExpiresAt(Date.now() + next.output_expires_in * 1_000);
        }
        window.localStorage.removeItem(RESUME_KEY);
        return;
      }
      if (isJobFailure(next)) {
        stopPolling();
        setFailure({
          message: next.error || `任务进入终态 ${next.status}。`,
          hint: "FAILED / CANCELLED / TIMED_OUT 以及任何 error 字段都是终态失败,重试不会让同一个任务复活——需要重新提交。",
        });
        setPhase("failed");
        window.localStorage.removeItem(RESUME_KEY);
      }
    },
    [stopPolling]
  );

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      pollCancelled.current = false;
      pollDelay.current = POLL_INTERVAL_MS;
      const loop = async () => {
        if (pollCancelled.current) return;
        try {
          await pollOnce(id);
        } catch {
          // Transient network blip — keep the loop alive and try again.
        }
        // pollOnce calls stopPolling on a terminal state, which flips the flag.
        if (pollCancelled.current) return;
        pollTimer.current = setTimeout(loop, pollDelay.current);
      };
      pollTimer.current = setTimeout(loop, 0);
    },
    [pollOnce, stopPolling]
  );

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  /* ---------------------------------------------------------------------- */
  /* Resume an in-flight job across a refresh                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const raw = window.localStorage.getItem(RESUME_KEY);
    if (!raw) return;
    try {
      const record = JSON.parse(raw) as ResumeRecord;
      if (!record.jobId) return;
      setJobId(record.jobId);
      setSubmittedAt(record.submittedAt);
      setPhase("tracking");
      startPolling(record.jobId);
    } catch {
      window.localStorage.removeItem(RESUME_KEY);
    }
    // Intentionally mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Actions                                                                 */
  /* ---------------------------------------------------------------------- */

  const reset = useCallback(() => {
    stopPolling();
    if (source) URL.revokeObjectURL(source.objectUrl);
    setSource(null);
    setPhase("idle");
    setUploadPercent(0);
    setFailure(null);
    setJob(null);
    setJobId(null);
    setSubmittedAt(null);
    setOutputExpiresAt(null);
    window.localStorage.removeItem(RESUME_KEY);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [source, stopPolling]);

  const onPickFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      stopPolling();
      setFailure(null);
      setJob(null);
      setJobId(null);
      setSubmittedAt(null);
      setOutputExpiresAt(null);
      setUploadPercent(0);
      setPhase("probing");
      try {
        const meta = await probeVideo(file);
        setSource((prev) => {
          if (prev) URL.revokeObjectURL(prev.objectUrl);
          return meta;
        });
        setPhase("ready");
      } catch (e) {
        setFailure({ message: e instanceof Error ? e.message : String(e) });
        setPhase("failed");
      }
    },
    [stopPolling]
  );

  const submit = useCallback(async () => {
    if (!source || preflight.length > 0) return;
    setFailure(null);

    // 1) Ask our proxy for a presigned upload URL.
    setPhase("requesting-upload");
    let ticket: VsrProUploadTicket;
    try {
      const response = await fetch("/api/vsrpro/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: source.file.name,
          content_type: source.contentType,
        }),
      });
      if (!response.ok) {
        setFailure(explainStatus(response.status, await readDetail(response)));
        setPhase("failed");
        return;
      }
      ticket = (await response.json()) as VsrProUploadTicket;
    } catch {
      setFailure({ message: "无法向 /api/vsrpro/uploads 申请上传地址。" });
      setPhase("failed");
      return;
    }

    if (source.file.size > ticket.max_bytes) {
      setFailure({
        message: `网关声明的上限是 ${formatBytes(ticket.max_bytes)},当前文件 ${formatBytes(
          source.file.size
        )}。`,
      });
      setPhase("failed");
      return;
    }

    // 2) Upload straight to object storage — this byte stream never touches
    //    our server.
    setPhase("uploading");
    setUploadPercent(0);
    try {
      await putWithProgress(
        ticket.upload_url,
        source.file,
        source.contentType,
        setUploadPercent
      );
    } catch (e) {
      setFailure({
        message: e instanceof Error ? e.message : String(e),
        hint: "如果由浏览器直连上传,对象存储的 CORS 策略必须允许本站 origin 的 PUT 与 GET(见文档 §8)。",
      });
      setPhase("failed");
      return;
    }

    // 3) Enqueue the render.
    setPhase("submitting");
    try {
      const response = await fetch("/api/vsrpro/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_key: ticket.input_key,
          resolution,
          model,
        }),
      });
      if (!response.ok) {
        setFailure(explainStatus(response.status, await readDetail(response)));
        setPhase("failed");
        return;
      }
      const created = (await response.json()) as VsrProJobCreated;
      const startedAt = Date.now();
      setJobId(created.job_id);
      setJob({ job_id: created.job_id, status: created.status });
      setSubmittedAt(startedAt);
      setNow(startedAt);
      setPhase("tracking");
      window.localStorage.setItem(
        RESUME_KEY,
        JSON.stringify({
          jobId: created.job_id,
          filename: source.file.name,
          submittedAt: startedAt,
        } satisfies ResumeRecord)
      );
      startPolling(created.job_id);
    } catch {
      setFailure({ message: "无法向 /api/vsrpro/jobs 提交任务。" });
      setPhase("failed");
    }
  }, [source, preflight.length, resolution, model, startPolling]);

  /** Re-poll to mint a fresh `output_url` after the old one expires. */
  const refreshOutput = useCallback(async () => {
    if (!jobId) return;
    try {
      await pollOnce(jobId);
    } catch {
      setFailure({ message: "刷新下载地址失败。" });
    }
  }, [jobId, pollOnce]);

  const checkHealth = useCallback(async () => {
    setHealth("checking");
    try {
      const response = await fetch("/api/vsrpro/health", { cache: "no-store" });
      const body = (await response.json()) as { reachable?: boolean };
      setHealth(body.reachable ? "up" : "down");
    } catch {
      setHealth("down");
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  const stages = job?.stages;
  /**
   * `route` / `stages` / `stage1_base` describe a two-stage render and are
   * simply absent for vsr-flash. Checking presence rather than branching on
   * `model` keeps one code path for both pipelines, which is what the doc
   * asks for.
   */
  const hasStageBreakdown = !!stages || !!job?.route || !!job?.stage1_base;

  const outputTtlLeft = outputExpiresAt
    ? Math.max(0, Math.floor((outputExpiresAt - now) / 1000))
    : null;

  const coldStart =
    phase === "tracking" &&
    !succeeded &&
    job?.status === "IN_QUEUE" &&
    elapsedMs > COLD_START_HINT_AFTER_MS;

  return (
    <div className="space-y-5">
      {!configured && (
        <Note tone="danger" icon={ShieldAlert}>
          <strong className="font-semibold">网关未配置。</strong> 服务端缺少{" "}
          <code className="rounded bg-black/30 px-1 font-mono">VSRPRO_API_KEY</code>
          ,所有代理路由都会返回 503。在部署环境里设好这个变量再试。
        </Note>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Step 1 — source                                                   */}
      {/* ---------------------------------------------------------------- */}
      <Panel step={1} title="选择源视频">
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => void onPickFile(e.target.files?.[0])}
        />

        {!source ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={phase === "probing"}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-white/30 hover:bg-white/5 disabled:opacity-50"
          >
            {phase === "probing" ? (
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            ) : (
              <FileVideo className="h-6 w-6 text-white/40" />
            )}
            <span className="text-sm font-medium text-white">
              {phase === "probing" ? "读取视频信息…" : "点击选择视频文件"}
            </span>
            <span className="font-mono text-[11px] text-white/40">
              {SUPPORTED_EXTENSIONS.join(" · ")} · 最大{" "}
              {formatBytes(MAX_UPLOAD_BYTES)} · 最长 {MAX_DURATION_SECONDS} 秒
            </span>
          </button>
        ) : (
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              {source.width > 0 ? (
                <video
                  src={source.objectUrl}
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-center">
                  <FileVideo className="h-6 w-6 text-white/30" />
                  <p className="px-4 text-xs text-white/50">
                    浏览器无法解码这个容器,本地预览不可用。
                    <br />
                    worker 在服务端解封装,所以不影响处理。
                  </p>
                </div>
              )}
            </div>

            <div>
              <Field
                label="文件名"
                value={<span className="break-all">{source.file.name}</span>}
              />
              <Field label="大小" value={formatBytes(source.file.size)} />
              <Field label="content_type" value={source.contentType} />
              <Field
                label="源尺寸"
                value={
                  source.width
                    ? `${source.width}×${source.height}`
                    : "未知(本地无法解码)"
                }
              />
              <Field
                label="时长"
                value={source.duration ? formatDuration(source.duration) : "未知"}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  换一个
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-full text-xs text-white/60 hover:bg-white/5 hover:text-white"
                  onClick={reset}
                  disabled={busy}
                >
                  <X className="h-3.5 w-3.5" />
                  清空
                </Button>
              </div>
            </div>
          </div>
        )}

        {preflight.length > 0 && (
          <div className="mt-4 space-y-2">
            {preflight.map((p) => (
              <Note key={p} tone="danger" icon={AlertTriangle}>
                {p}
              </Note>
            ))}
          </div>
        )}
      </Panel>

      {/* ---------------------------------------------------------------- */}
      {/* Step 2 — settings                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Panel step={2} title="配置任务" muted={!source}>
        <div className="space-y-6">
          {/* resolution ------------------------------------------------- */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-white/40" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                resolution — 交付预设
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {RESOLUTION_PRESETS.map((p) => {
                const active = resolution === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setResolution(p.value)}
                    disabled={busy}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                      active
                        ? "border-white/40 bg-white/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-white">
                        {p.label}
                      </span>
                      {p.deprecated && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                          已废弃
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-white/40">
                      短边 {p.shortEdge} px
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-white/50">
              {preset.blurb}
            </p>

            {resolution === "original" && (
              <div className="mt-3">
                <Note tone="warn" icon={AlertTriangle}>
                  <strong className="font-semibold">
                    &ldquo;original&rdquo; 不再保持源尺寸。
                  </strong>{" "}
                  1.1 起它就是 &ldquo;1080p&rdquo; 的别名:4K 源会被交付成 1080,540p
                  源会被放大到 1080。现在没有任何预设表示「保持输入尺寸」,请直接选你想要的尺寸。
                </Note>
              </div>
            )}

            {predicted && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-sm">
                  <span className="text-white/60">
                    {source!.width}×{source!.height}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                  <span className="font-semibold text-white">
                    {predicted.width}×{predicted.height}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                  预设锁定的是<strong className="text-white/70">短边</strong>
                  ,不是边界框——宽高比保持不变,长边跟着源走。
                  {predicted.width > predicted.height &&
                    predicted.width > preset.shortEdge * (16 / 9) + 1 && (
                      <>
                        {" "}
                        所以这个素材的输出会比预设名字暗示的更宽(
                        {predicted.width} px,不是 {Math.round(preset.shortEdge * (16 / 9))}
                        px)。
                      </>
                    )}
                </p>
                {willDownscale && (
                  <div className="mt-3">
                    <Note tone="warn" icon={AlertTriangle}>
                      预设是目标值而不是下限。源的短边已经是{" "}
                      {Math.min(source!.width, source!.height)} px,选这个预设会把它
                      <strong className="font-semibold">缩小</strong>到 {preset.shortEdge}{" "}
                      px,出来比进去时更小。
                    </Note>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* model ------------------------------------------------------ */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-white/40" />
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                model — 由哪条流水线渲染
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODEL_PRESETS.map((m) => {
                const active = model === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModel(m.value)}
                    disabled={busy}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                      active
                        ? "border-white/40 bg-white/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="font-mono text-sm font-semibold text-white">
                      {m.label}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      {m.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-white/50">
              <span className="text-white/70">什么时候用:</span>{" "}
              {modelPreset.useWhen}
            </p>

            {model === "vsr-flash" ? (
              <div className="mt-3">
                <Note tone="warn" icon={AlertTriangle}>
                  <strong className="font-semibold">
                    两者差的是一个阶段,不是一档画质选项。
                  </strong>{" "}
                  {modelPreset.caveat} 另外:如果这个网关没配置 flash endpoint,请求会返回{" "}
                  <code className="rounded bg-black/30 px-1 font-mono">503</code>
                  ,而不是退回默认流水线。
                </Note>
              </div>
            ) : (
              <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                {modelPreset.caveat}
              </p>
            )}
          </div>

          <Button
            className="w-full gap-2 rounded-full bg-white text-black hover:bg-white/90"
            disabled={!source || preflight.length > 0 || busy || !configured}
            onClick={() => void submit()}
          >
            {phase === "requesting-upload" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                申请上传地址…
              </>
            )}
            {phase === "uploading" && (
              <>
                <Upload className="h-4 w-4" />
                上传中 {uploadPercent.toFixed(0)}%
              </>
            )}
            {phase === "submitting" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交任务…
              </>
            )}
            {phase === "tracking" && !succeeded && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                处理中…
              </>
            )}
            {(phase === "idle" ||
              phase === "probing" ||
              phase === "ready" ||
              phase === "failed" ||
              (phase === "tracking" && succeeded)) && (
              <>
                上传并开始放大
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {phase === "uploading" && (
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
          )}
        </div>
      </Panel>

      {/* ---------------------------------------------------------------- */}
      {/* Step 3 — job                                                      */}
      {/* ---------------------------------------------------------------- */}
      <Panel step={3} title="任务状态与结果" muted={!job && phase !== "failed"}>
        {!job && phase !== "failed" && (
          <p className="text-sm text-white/40">
            提交后会每 {POLL_INTERVAL_MS / 1000} 秒轮询一次{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-xs">
              GET /v1/jobs/{"{id}"}
            </code>
            ,直到进入终态。
          </p>
        )}

        {failure && (
          <div className="space-y-3">
            <Note tone="danger" icon={AlertTriangle}>
              <p className="font-semibold">{failure.message}</p>
              {failure.hint && (
                <p className="mt-1.5 opacity-80">{failure.hint}</p>
              )}
            </Note>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white"
              onClick={reset}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              重新开始
            </Button>
          </div>
        )}

        {job && (
          <div className="space-y-5">
            {/* status line -------------------------------------------- */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs ${
                  succeeded
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                    : isJobFailure(job)
                    ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
                    : "border-sky-400/30 bg-sky-500/15 text-sky-300"
                }`}
              >
                {succeeded ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isJobFailure(job) ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {job.status}
              </span>
              {submittedAt && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-white/45">
                  <Clock className="h-3.5 w-3.5" />
                  wall {formatDuration(elapsedMs / 1000)}
                </span>
              )}
              <span className="break-all font-mono text-[11px] text-white/30">
                {job.job_id}
              </span>
            </div>

            {coldStart && (
              <Note tone="info" icon={Info}>
                <strong className="font-semibold">大概是冷启动。</strong>{" "}
                两条流水线在空闲约 30 秒后都会缩到 0,所以没有热 worker 时,首个任务要先等
                worker 启动——实测总耗时 120–235 秒(排队 + 模型加载)。停在{" "}
                <code className="rounded bg-black/30 px-1 font-mono">IN_QUEUE</code>{" "}
                一两分钟是正常的,不是卡住。等待时间不计入{" "}
                <code className="rounded bg-black/30 px-1 font-mono">seconds</code>。
              </Note>
            )}

            {/* result --------------------------------------------------- */}
            {succeeded && job.output_url && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <video
                    src={job.output_url}
                    controls
                    preload="metadata"
                    className="aspect-video w-full bg-black"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    className="gap-2 rounded-full bg-white text-black hover:bg-white/90"
                  >
                    <a href={job.output_url} download>
                      <Download className="h-4 w-4" />
                      下载结果
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white"
                    onClick={() => void refreshOutput()}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    刷新下载地址
                  </Button>
                  {outputTtlLeft !== null && (
                    <span className="font-mono text-xs text-white/40">
                      {outputTtlLeft > 0
                        ? `地址剩余 ${formatDuration(outputTtlLeft)}`
                        : "地址已过期——点上面刷新"}
                    </span>
                  )}
                </div>
                <Note tone="info" icon={ShieldAlert}>
                  <code className="rounded bg-black/30 px-1 font-mono">output_url</code>{" "}
                  是一个限时的 bearer 能力:过期前<strong className="font-semibold">
                    任何拿到它的人
                  </strong>
                  都能下载这个结果,不需要 API Key。所以它不写日志、不长期保存、也不出现在本页面的
                  URL 里。有效期 {OUTPUT_URL_TTL_SECONDS / 3600} 小时,过期后重新轮询即可拿到新地址。
                </Note>
              </div>
            )}

            {/* render facts -------------------------------------------- */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                  <Gauge className="h-3.5 w-3.5" />
                  交付与吞吐
                </h3>
                <Field label="model" value={job.model ?? "—"} />
                <Field label="target" value={job.target ?? "—"} />
                <Field
                  label="target_short_edge"
                  value={job.target_short_edge ?? "—"}
                />
                <Field
                  label="source"
                  value={
                    job.source
                      ? `${job.source.width}×${job.source.height}`
                      : "—"
                  }
                />
                <Field label="frames" value={job.frames ?? job.source?.frames ?? "—"} />
                <Field
                  label="seconds (渲染,不含排队)"
                  value={job.seconds !== undefined ? job.seconds.toFixed(2) : "—"}
                />
                <Field
                  label="fps"
                  value={job.fps !== undefined ? job.fps.toFixed(3) : "—"}
                />
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                  <Layers className="h-3.5 w-3.5" />
                  阶段拆解
                </h3>
                {hasStageBreakdown ? (
                  <>
                    <Field label="route" value={job.route ?? "—"} />
                    <Field label="stage1_base" value={job.stage1_base ?? "—"} />
                    <Field label="stages.stage1" value={stages?.stage1 ?? "—"} />
                    <Field
                      label="stages.stage1_s (修复)"
                      value={
                        stages?.stage1_s !== undefined
                          ? stages.stage1_s.toFixed(2)
                          : "—"
                      }
                    />
                    <Field
                      label="stages.proteus_s (2× 放大)"
                      value={
                        stages?.proteus_s !== undefined
                          ? stages.proteus_s.toFixed(2)
                          : "不出现(1080p:direct 不放大)"
                      }
                    />
                    <Field
                      label="stages.fit_s (贴合尺寸)"
                      value={
                        stages?.fit_s !== undefined ? stages.fit_s.toFixed(2) : "—"
                      }
                    />
                    <p className="mt-3 text-[11px] leading-relaxed text-white/40">
                      这里读的是{" "}
                      <code className="rounded bg-white/10 px-1 font-mono">
                        stage1_s
                      </code>
                      ,不是{" "}
                      <code className="rounded bg-white/10 px-1 font-mono">
                        vsr_pro_s
                      </code>
                      。旧字段留在契约里只为让老客户端不报错,当前路径下它不下发、
                      <code className="rounded bg-white/10 px-1 font-mono">
                        vsr_pro_base
                      </code>{" "}
                      恒为 null。只读旧字段会得到一份没有修复耗时的拆解,而修复占渲染约 70%。
                    </p>
                  </>
                ) : (
                  <p className="text-xs leading-relaxed text-white/45">
                    这个任务没有返回{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">route</code>、
                    <code className="rounded bg-white/10 px-1 font-mono">stages</code>、
                    <code className="rounded bg-white/10 px-1 font-mono">
                      stage1_base
                    </code>{" "}
                    和{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">
                      vsr_pro_base
                    </code>
                    。这些字段描述的是两阶段渲染;单阶段的{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">vsr-flash</code>{" "}
                    没有修复基底可报告,也没有可拆分归因的耗时,此时{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">seconds</code> 和{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">fps</code>{" "}
                    覆盖整个渲染。本页按「可选字段」解析,而不是按{" "}
                    <code className="rounded bg-white/10 px-1 font-mono">model</code>{" "}
                    分支处理。
                  </p>
                )}
              </div>
            </div>

            {/* raw ----------------------------------------------------- */}
            <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <summary className="cursor-pointer text-xs font-medium text-white/70">
                原始响应 JSON（output_url 已脱敏）
              </summary>
              <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-white/60">
                {JSON.stringify(
                  {
                    ...job,
                    output_url: job.output_url
                      ? "<presigned — redacted>"
                      : undefined,
                  },
                  null,
                  2
                )}
              </pre>
            </details>

            {(succeeded || isJobFailure(job)) && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white"
                onClick={reset}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                再跑一个
              </Button>
            )}
          </div>
        )}
      </Panel>

      {/* ---------------------------------------------------------------- */}
      {/* Reference                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">参考</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-white"
              onClick={() => void checkHealth()}
              disabled={health === "checking"}
            >
              {health === "checking" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              /healthz
            </Button>
            {health !== "unknown" && health !== "checking" && (
              <span
                className={`font-mono text-xs ${
                  health === "up" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {health === "up" ? "ok" : "unreachable"}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              使用限制
            </h3>
            <Field label="最大上传大小" value={`${formatBytes(MAX_UPLOAD_BYTES)} → 413`} />
            <Field
              label="输入最大时长"
              value={`${MAX_DURATION_SECONDS} s → 任务带 error 失败`}
            />
            <Field label="请求频率" value={`${RATE_LIMIT_PER_MINUTE} /min → 429`} />
            <Field
              label="每个模型并发"
              value={`${MAX_CONCURRENT_JOBS_PER_MODEL} → 多出的排队`}
            />
            <Field label="上传地址有效期" value="1 h" />
            <Field label="输出地址有效期" value="24 h" />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              按源尺寸估算,不要按预设估算
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-white/45">
              修复阶段约占渲染耗时的 70%,而它的开销跟着{" "}
              <code className="rounded bg-white/10 px-1 font-mono">stage1_base</code>{" "}
              走,不跟着交付尺寸走。所以下面前两行都在 5–6 fps,输出像素却差三倍——它们都在
              1080 基底上修复。
            </p>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-white/5 text-white/50">
                  <tr>
                    <th className="px-2.5 py-2 font-medium">源</th>
                    <th className="px-2.5 py-2 font-medium">预设</th>
                    <th className="px-2.5 py-2 font-medium">路径</th>
                    <th className="px-2.5 py-2 font-medium">吞吐</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  {[
                    ["640×360", "4k", "4k:1080base+2x", "~5.1 fps"],
                    ["1920×1080", "1080p", "1080p:direct", "~5.9 fps"],
                    ["640×360", "1080p", "1080p:540base+2x", "~16.6 fps"],
                  ].map((row) => (
                    <tr key={row.join()} className="border-t border-white/5">
                      {row.map((cell) => (
                        <td key={cell} className="px-2.5 py-1.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-white/40">
              <code className="rounded bg-white/10 px-1 font-mono">vsr-flash</code>{" "}
              不返回路径字段;它跳过修复阶段,吞吐大致是{" "}
              <code className="rounded bg-white/10 px-1 font-mono">vsr-combined</code>{" "}
              的 ~2 倍。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
