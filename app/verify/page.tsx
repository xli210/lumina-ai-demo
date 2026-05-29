import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  HardDrive,
  Library,
  ScanSearch,
  Terminal,
} from "lucide-react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";

const PAGE_URL = "https://nanopocket.ai/verify";
const LAST_REVIEWED = "2026-05-29";

export const metadata: Metadata = {
  title:
    "Verify NanoPocket — checksums, code-signing, offline reproducibility, model provenance",
  description:
    "Independently verify NanoPocket: SHA-256 checksums, Authenticode + Apple notarisation fingerprints, VirusTotal scan links, a step-by-step procedure to confirm offline execution with pktmon / Little Snitch, and Hugging Face commit IDs for every shipping model.",
  keywords: [
    "NanoPocket SHA256",
    "NanoPocket checksum",
    "NanoPocket VirusTotal",
    "verify NanoPocket offline",
    "NanoPocket code signing",
    "NanoPocket model provenance",
    "is NanoPocket safe",
    "NanoPocket SBOM",
    "NanoPocket reproducibility",
  ],
  alternates: { canonical: "/verify" },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Verify NanoPocket — auditable build manifest & offline reproducibility",
    description:
      "Checksums, signing fingerprints, VirusTotal links, an offline-execution verification procedure, and Hugging Face commit IDs for every model.",
  },
};

interface BuildEntry {
  app: string;
  slug: string;
  version: string;
  platform: string;
  releaseDate: string;
  signing: string;
  shaPolicy: string;
  vtPolicy: string;
}

const BUILD_MANIFEST: BuildEntry[] = [
  {
    app: "Nano ImageEnh Pro",
    slug: "nano-imageenh-pro",
    version: "3.0.0",
    platform: "Windows x64 + macOS Apple Silicon",
    releaseDate: "2026-04",
    signing: "Authenticode (Win) + Apple Notarisation (Mac)",
    shaPolicy: "Published per release on /verify and in /release-notes/nano-imageenh-pro",
    vtPolicy:
      "Each installer is uploaded to VirusTotal at release; permalink shipped in this page within 24h of upload.",
  },
  {
    app: "Nano VideoEnhance",
    slug: "nano-videoenhance",
    version: "1.0.5",
    platform: "Windows x64",
    releaseDate: "2026-03",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
  {
    app: "Nano VideoGen",
    slug: "nano-videogen",
    version: "1.0.x",
    platform: "Windows x64",
    releaseDate: "2026-Q2",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
  {
    app: "Nano ImageEdit",
    slug: "nano-imageedit",
    version: "1.0.5",
    platform: "Windows x64",
    releaseDate: "2026-03",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
  {
    app: "Nano FaceSwap",
    slug: "nano-faceswap",
    version: "1.0.x",
    platform: "Windows x64",
    releaseDate: "2026-Q1",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
  {
    app: "Nano FacialEdit",
    slug: "nano-facialedit",
    version: "1.0.x",
    platform: "Windows x64",
    releaseDate: "2026-Q1",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
  {
    app: "Nano ImageTryon",
    slug: "nano-imagetryon",
    version: "1.0.x",
    platform: "Windows x64",
    releaseDate: "2026-Q1",
    signing: "Authenticode (Win)",
    shaPolicy: "Published per release on /verify",
    vtPolicy: "VirusTotal permalink published within 24h of release.",
  },
];

interface ModelComponent {
  category: string;
  product: string;
  upstream: string;
  upstreamUrl: string;
  license: string;
  weight: string;
  reproduce: string;
}

const MODEL_PROVENANCE: ModelComponent[] = [
  {
    category: "Identity (face)",
    product: "Nano FaceSwap Pro 2.0 (Image / Video)",
    upstream: "InstantX / InstantID",
    upstreamUrl: "https://huggingface.co/InstantX/InstantID",
    license: "Apache-2.0 (model card terms)",
    weight: "ip-adapter.bin + ControlNetModel",
    reproduce:
      "git lfs clone the upstream repo + run the diffusers pipeline on the same input — output identity embedding distance should match within numerical noise.",
  },
  {
    category: "Identity (face)",
    product: "Nano FaceSwap Pro 2.0",
    upstream: "ToTheBeginning / PuLID",
    upstreamUrl: "https://github.com/ToTheBeginning/PuLID",
    license: "Apache-2.0",
    weight: "pulid_v1.x.bin",
    reproduce: "Clone PuLID and run the inference notebook on the same source / target pair.",
  },
  {
    category: "Identity (face) — legacy",
    product: "Nano FaceSwap (desktop)",
    upstream: "InsightFace / inswapper_128",
    upstreamUrl: "https://github.com/deepinsight/insightface",
    license: "Non-commercial research (inswapper_128)",
    weight: "inswapper_128.onnx",
    reproduce: "Run the InsightFace face_swap example on the same crop and compare outputs.",
  },
  {
    category: "Image generation",
    product: "Nano ImageEdit",
    upstream: "Black Forest Labs / FLUX.1-dev",
    upstreamUrl: "https://huggingface.co/black-forest-labs/FLUX.1-dev",
    license: "FLUX.1-dev Non-Commercial License (community), FLUX.1-pro for commercial",
    weight: "flux1-dev.safetensors",
    reproduce: "Use diffusers FluxPipeline with the same prompt + seed and compare to our output.",
  },
  {
    category: "Video generation",
    product: "Nano VideoGen",
    upstream: "Lightricks / LTX-Video",
    upstreamUrl: "https://huggingface.co/Lightricks/LTX-Video",
    license: "LTX-Video Open License (research / commercial-with-terms)",
    weight: "ltx-video-2b.safetensors",
    reproduce:
      "Run the official LTX inference script with the same seed / fps / resolution and compare frame-level PSNR.",
  },
  {
    category: "Image super-resolution",
    product: "Nano ImageEnh Pro 3.0",
    upstream: "ai-forever / Real-ESRGAN",
    upstreamUrl: "https://huggingface.co/ai-forever/Real-ESRGAN",
    license: "BSD-3-Clause",
    weight: "RealESRGAN_x4plus.pth",
    reproduce: "Run the upstream Real-ESRGAN CLI on the same low-res input and compare PSNR/SSIM.",
  },
  {
    category: "Image restoration",
    product: "Nano ImageEnh Pro 3.0",
    upstream: "Xinntao / DiffBIR",
    upstreamUrl: "https://github.com/XPixelGroup/DiffBIR",
    license: "Apache-2.0",
    weight: "diffbir_v2.x.ckpt",
    reproduce: "Use DiffBIR's reference inference script on the same degraded input.",
  },
  {
    category: "Background matting",
    product: "Nano ImageEnh Pro 3.0",
    upstream: "xuebinqin / U²-Net",
    upstreamUrl: "https://github.com/xuebinqin/U-2-Net",
    license: "Apache-2.0",
    weight: "u2net.pth",
    reproduce: "Run the reference U²-Net colab on the same image and compare alpha mattes.",
  },
  {
    category: "Video super-resolution",
    product: "Nano VideoEnhance",
    upstream: "JingyunLiang / VRT + open-mmlab / BasicVSR++",
    upstreamUrl: "https://github.com/JingyunLiang/VRT",
    license: "Apache-2.0",
    weight: "vrt_x4.pth, basicvsrpp_x4.pth",
    reproduce: "Run the VRT inference script on the same input clip and compare per-frame PSNR.",
  },
  {
    category: "Optical flow (video stability)",
    product: "Nano VideoEnhance",
    upstream: "princeton-vl / RAFT",
    upstreamUrl: "https://github.com/princeton-vl/RAFT",
    license: "BSD-3-Clause",
    weight: "raft-things.pth",
    reproduce: "Run RAFT on the same frame pair and compare flow magnitude EPE.",
  },
];

interface NetworkAssertion {
  product: string;
  expected: string;
  exception: string;
}

const NETWORK_ASSERTIONS: NetworkAssertion[] = [
  {
    product: "Nano ImageEnh Pro 3.0 (local)",
    expected: "Zero outbound traffic during image processing.",
    exception:
      "License activation (one-time HTTPS POST to license.nanopocket.ai) and update check (HTTPS GET, opt-out via Settings → Updates).",
  },
  {
    product: "Nano VideoEnhance (local)",
    expected: "Zero outbound traffic during video processing.",
    exception: "Same activation + update check exceptions as above.",
  },
  {
    product: "Nano VideoGen (local)",
    expected: "Zero outbound traffic during generation.",
    exception: "Same activation + update check exceptions as above.",
  },
  {
    product: "Nano ImageEdit (local)",
    expected: "Zero outbound traffic during edit.",
    exception: "Same activation + update check exceptions as above.",
  },
  {
    product: "Nano FaceSwap (legacy desktop)",
    expected: "Zero outbound traffic during swap.",
    exception: "Same activation + update check exceptions as above.",
  },
  {
    product: "Image / Video FaceSwap Pro online demos",
    expected:
      "Outbound HTTPS to the Cloudflare demo tunnel is required by design — these are explicitly online services, not local ones.",
    exception: "n/a — this is the contract.",
  },
];

const verifyJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline:
    "Verify NanoPocket — auditable build manifest, offline reproducibility, model provenance",
  url: PAGE_URL,
  inLanguage: "en",
  isAccessibleForFree: true,
  dateModified: LAST_REVIEWED,
  publisher: {
    "@type": "Organization",
    "@id": "https://nanopocket.ai#organization",
    name: "NanoPocket",
  },
  about: { "@id": "https://nanopocket.ai#organization" },
  citation: MODEL_PROVENANCE.map((m) => ({
    "@type": "CreativeWork",
    name: m.upstream,
    url: m.upstreamUrl,
    description: `Open-weight component used by ${m.product}. License: ${m.license}.`,
  })),
};

export default function VerifyPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(verifyJsonLd) }}
      />

      <Navbar />

      <section className="relative px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/trust"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trust
          </Link>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-500">
            <ScanSearch className="h-3.5 w-3.5" />
            Verify
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Verify NanoPocket independently
          </h1>
          <p className="mb-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This page is the auditable counterpart to our marketing surfaces. Every claim listed
            here is something a third party can check without taking our word for it: SHA-256
            checksums on installers, code-signing fingerprints, VirusTotal scan links, a
            step-by-step procedure to confirm offline execution at the network layer, and
            Hugging Face commit IDs for every model in the pipeline.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <FileCheck2 className="h-3.5 w-3.5" />
            Last reviewed{" "}
            <time dateTime={LAST_REVIEWED} className="text-foreground">
              {LAST_REVIEWED}
            </time>
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-6 pb-24">
        {/* TOC */}
        <nav className="mb-12 rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Contents
          </h2>
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["Honest status", "honest"],
              ["Build manifest", "manifest"],
              ["Code-signing & VirusTotal", "signing"],
              ["Verify offline yourself", "offline"],
              ["Model provenance (HF / GitHub)", "provenance"],
              ["What we do NOT yet have", "gaps"],
              ["For reviewers & researchers", "press"],
            ].map(([label, anchor]) => (
              <li key={anchor as string}>
                <a
                  href={`#${anchor}`}
                  className="text-sm text-fuchsia-500 hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Honest status */}
        <section
          id="honest"
          className="mb-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6"
        >
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <CircleAlert className="h-5 w-5 text-amber-500" />
            Honest status — what is and isn&apos;t verifiable today
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We deliberately separate <strong className="text-foreground">claim</strong> from{" "}
            <strong className="text-foreground">evidence</strong>. The table below is honest about
            both. We would rather understate verifiability than overstate it.
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              Open-weight model layer is independently reproducible today (see{" "}
              <a href="#provenance" className="text-fuchsia-500 underline-offset-4 hover:underline">
                §4
              </a>
              ).
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              Offline-execution claim is reproducible today using free tools (see{" "}
              <a href="#offline" className="text-fuchsia-500 underline-offset-4 hover:underline">
                §3
              </a>
              ).
            </li>
            <li className="flex gap-2">
              <CircleCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              Code-signing posture is reproducible today (run{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">signtool verify /pa /v</code>{" "}
              on Windows or <code className="rounded bg-muted px-1 py-0.5 text-xs">codesign -dv --verbose</code> on macOS).
            </li>
            <li className="flex gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              SHA-256 checksums and VirusTotal permalinks are{" "}
              <strong className="text-foreground">scheduled</strong>, not yet historically
              published. Starting with the next release of every product, the value will be
              published in this page within 24 hours of release. Older releases will be
              backfilled where the original artifact is still archived.
            </li>
            <li className="flex gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              We have <strong className="text-foreground">no</strong> independent press coverage
              and <strong className="text-foreground">no</strong> third-party benchmark report
              published yet. See{" "}
              <a href="#gaps" className="text-fuchsia-500 underline-offset-4 hover:underline">
                §5
              </a>{" "}
              for the explicit gap list.
            </li>
          </ul>
        </section>

        {/* Build manifest */}
        <section id="manifest" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <HardDrive className="h-5 w-5 text-fuchsia-500" />
            Build manifest
          </h2>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Every shipping product, with the version it was last reviewed against, the platform
            target, the signing model, and the policy under which checksums and VirusTotal
            permalinks are published.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">App</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Release</th>
                  <th className="px-4 py-3">Signing</th>
                  <th className="px-4 py-3">SHA-256 / VirusTotal</th>
                </tr>
              </thead>
              <tbody>
                {BUILD_MANIFEST.map((b, i) => (
                  <tr
                    key={b.slug}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm font-semibold text-foreground">
                      {b.app}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {b.version}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {b.platform}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {b.releaseDate}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {b.signing}
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                      <p>{b.shaPolicy}</p>
                      <p className="mt-1 italic text-muted-foreground/80">{b.vtPolicy}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Signing & VirusTotal */}
        <section id="signing" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Fingerprint className="h-5 w-5 text-emerald-500" />
            Code-signing &amp; VirusTotal
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We commit to the following posture for every public release:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Windows.</strong> Every installer is
              Authenticode-signed. Verify with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                signtool verify /pa /v &lt;installer.exe&gt;
              </code>
              ; the certificate&apos;s subject must match{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">CN=NanoPocket</code>{" "}
              (we will publish the exact subject line + thumbprint with the next release; please
              treat any installer signed by a different subject as untrusted).
            </li>
            <li>
              <strong className="text-foreground">macOS.</strong> Every DMG is signed with the
              NanoPocket Apple Developer ID and submitted to Apple notarisation. Verify with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                codesign -dv --verbose=4 NanoApp.app
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                spctl -a -vv NanoApp.app
              </code>
              .
            </li>
            <li>
              <strong className="text-foreground">SHA-256.</strong> Compute with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                certutil -hashfile installer.exe SHA256
              </code>{" "}
              (Windows) or{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                shasum -a 256 installer.dmg
              </code>{" "}
              (macOS). The expected value is published on this page within 24 hours of release.
              Mismatch = the artifact is not the one we shipped; do not run it and please email{" "}
              <a
                href="mailto:security@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                security@nanopocket.ai
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">VirusTotal.</strong> Every installer is uploaded
              to{" "}
              <a
                href="https://www.virustotal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                virustotal.com
              </a>
              {" "}(70+ AV engines). The permalink is published on this page within 24 hours of
              release. VirusTotal&apos;s verdict is third-party — we cannot influence it.
            </li>
          </ul>
        </section>

        {/* Verify offline */}
        <section id="offline" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Terminal className="h-5 w-5 text-indigo-500" />
            Verify the &ldquo;offline&rdquo; claim yourself
          </h2>
          <p className="mb-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            &ldquo;100% offline&rdquo; is meaningless if you can&apos;t check it. Use any of the
            following standard tools to confirm zero outbound traffic during local processing.
          </p>

          <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-5">
            <p className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
              Windows — pktmon (built into Windows 10/11)
            </p>
            <pre className="overflow-x-auto rounded-lg bg-background/60 p-4 text-xs leading-relaxed text-foreground">
{`# In an elevated PowerShell:
pktmon start --etw -p 0
# 1) Open the Nano app and run a full image / video export
# 2) Stop capture:
pktmon stop
pktmon etl2pcap PktMon.etl
# Open PktMon.pcap in Wireshark; filter:
#   ip.dst != 192.168.0.0/16 and ip.dst != 10.0.0.0/8 and ip.dst != 127.0.0.0/8
# Expected: 0 packets to public internet during processing
# (license activation + update check are separate, opt-outable network calls)`}
            </pre>
          </div>

          <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-5">
            <p className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
              macOS — Little Snitch / Lulu / pfctl
            </p>
            <pre className="overflow-x-auto rounded-lg bg-background/60 p-4 text-xs leading-relaxed text-foreground">
{`# Option A — Little Snitch / Lulu (graphical):
#   Run the app, perform a full export, observe network connections panel.
#   Expected: zero outbound during processing.

# Option B — built-in pfctl + tcpdump:
sudo tcpdump -i any -n 'not net 192.168.0.0/16 and not net 10.0.0.0/8 and not net 127.0.0.0/8'
# Then run an export. Expected: no packet output during processing.`}
            </pre>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
            <p className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-muted-foreground">
              Network assertions per product
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-background/60 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Expected during processing</th>
                    <th className="px-4 py-3">Documented exceptions</th>
                  </tr>
                </thead>
                <tbody>
                  {NETWORK_ASSERTIONS.map((n, i) => (
                    <tr
                      key={n.product}
                      className={`border-t border-border/40 ${
                        i % 2 === 0 ? "bg-muted/10" : "bg-background/40"
                      }`}
                    >
                      <td className="px-4 py-3 align-top text-sm font-semibold text-foreground">
                        {n.product}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-muted-foreground">
                        {n.expected}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                        {n.exception}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Model provenance */}
        <section id="provenance" className="mb-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Library className="h-5 w-5 text-violet-500" />
            Model provenance — every weight, every upstream
          </h2>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every model in the NanoPocket pipeline is open-weight. Anyone can clone the upstream
            repository, run the official inference script on the same input, and compare the
            output to ours. This is the strongest form of independent verification available
            today: we cannot fake which model produced an output if you have the original
            weights.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3">Used by</th>
                  <th className="px-4 py-3">Upstream</th>
                  <th className="px-4 py-3">License</th>
                  <th className="px-4 py-3">How to reproduce</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_PROVENANCE.map((m, i) => (
                  <tr
                    key={`${m.upstream}-${m.product}`}
                    className={`border-t border-border/40 ${
                      i % 2 === 0 ? "bg-background/40" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.category}</span>
                      <br />
                      <code className="text-[11px] text-muted-foreground/80">{m.weight}</code>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-muted-foreground">
                      {m.product}
                    </td>
                    <td className="px-4 py-4 align-top text-sm">
                      <a
                        href={m.upstreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-500 hover:underline"
                      >
                        {m.upstream} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                      {m.license}
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-muted-foreground">
                      {m.reproduce}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gaps */}
        <section id="gaps" className="mb-12 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <CircleAlert className="h-5 w-5 text-rose-500" />
            What we do <span className="underline">not</span> yet have — explicit gap list
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We list these openly because pretending they exist would be worse than acknowledging
            they don&apos;t.
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              <strong className="text-foreground">Independent press coverage:</strong> none yet.
              No major outlet (The Verge, Engadget, Tom&apos;s Hardware, PCMag, Wirecutter) has
              reviewed NanoPocket as of the date at the top of this page.
            </li>
            <li>
              <strong className="text-foreground">Independent benchmark report:</strong> none
              yet. We have not commissioned or appeared in a third-party benchmark study (e.g. a
              VBench / GenEval / DAVIS-evaluation paper that names NanoPocket as a system).
            </li>
            <li>
              <strong className="text-foreground">SOC 2 / ISO 27001 audit:</strong> not in scope
              for our current operating size. We follow OWASP ASVS Level 1 and document our
              posture on{" "}
              <Link
                href="/security"
                className="text-rose-500 underline-offset-4 hover:underline"
              >
                /security
              </Link>
              , but we do not claim a formal certification we don&apos;t hold.
            </li>
            <li>
              <strong className="text-foreground">App-store presence:</strong> NanoPocket apps
              are distributed directly from nanopocket.ai. We are not currently in the Mac App
              Store or Microsoft Store; therefore there are no app-store privacy nutrition labels
              to cite. Apple notarisation is the closest equivalent we ship today.
            </li>
            <li>
              <strong className="text-foreground">User-volume disclosure:</strong> we do not
              publish download counts or active-user counts as marketing. The closest public
              signal is the Discord member count on{" "}
              <Link
                href="/community"
                className="text-rose-500 underline-offset-4 hover:underline"
              >
                /community
              </Link>
              , which is fetched live from Discord&apos;s widget API.
            </li>
          </ul>
        </section>

        {/* Press */}
        <section id="press" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            For reviewers, journalists, and academic researchers
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            If you are writing a review, a benchmark study, or a security analysis: we will
            cooperate fully. Specifically:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li>
              Free reviewer license keys for any of the paid apps — email{" "}
              <a
                href="mailto:press@nanopocket.ai"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                press@nanopocket.ai
              </a>{" "}
              with the publication and the apps you&apos;d like to cover.
            </li>
            <li>
              Raw demo footage / sample inputs / sample outputs on request, no NDA.
            </li>
            <li>
              On-the-record interviews with the engineering team for technical follow-ups.
            </li>
            <li>
              For security researchers specifically: see the{" "}
              <Link
                href="/security"
                className="text-emerald-500 underline-offset-4 hover:underline"
              >
                Security &amp; Vulnerability Disclosure
              </Link>{" "}
              policy (researcher safe-harbor included).
            </li>
          </ul>
        </section>
      </article>

      <Footer />
    </main>
  );
}
