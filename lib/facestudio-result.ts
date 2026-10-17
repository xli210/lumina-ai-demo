/**
 * Fetching a finished Face Studio result image.
 *
 * The result is a full-resolution PNG (up to ~4080x4080, around 20 MB). It used
 * to travel R2 -> gateway (Render) -> Vercel -> browser, so every view of every
 * result counted against Render's outbound bandwidth. On 2026-10-17 that used
 * up the Hobby workspace's 5 GB and Render suspended the gateway.
 *
 * Now the image is read straight from R2 (a short-lived signed address minted
 * here; R2 charges nothing for egress), and the gateway is only the fallback.
 * Pure on purpose: everything it touches is passed in, so the cases are testable.
 */

export interface ResultDeps {
  /** A signed address for an object key, or null when storage is not configured here. */
  storageUrl: (key: string) => string | null;
  fetchFn: (url: string) => Promise<Response>;
  /** The old way: ask the gateway for the image. */
  viaGateway: () => Promise<Response>;
  /** Folder in the bucket the worker writes results to (the gateway's S3_OUTPUT_PREFIX). */
  outputPrefix: string;
  isValidJobId: (id: string) => boolean;
  /** How long storage gets to start answering before the gateway is asked instead (default 8 s). */
  storageTimeoutMs?: number;
}

export function resultObjectKey(outputPrefix: string, jobId: string): string {
  return `${outputPrefix.replace(/^\/+|\/+$/g, "")}/${jobId}.png`;
}

/** Resolves with the response, or rejects if it has not started answering in `ms`. The late response, if any, is released. */
function startsWithin(p: Promise<Response>, ms: number): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => {
      // Whatever arrives later is of no use: free its connection.
      p.then((late) => release(late)).catch(() => undefined);
      reject(new Error("storage did not answer in time"));
    }, ms);
    p.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** Free a response we are not going to read. Never waited for: a body that will not close must not hold anything up. */
function release(res: Response): void {
  try {
    void Promise.resolve(res.body?.cancel()).catch(() => undefined);
  } catch {
    /* nothing to release */
  }
}

export async function fetchResultPreferStorage(jobId: string, deps: ResultDeps): Promise<Response> {
  if (deps.isValidJobId(jobId)) {
    const url = deps.storageUrl(resultObjectKey(deps.outputPrefix, jobId));
    if (url) {
      try {
        // The timeout covers the time to the first byte of the answer only, so a
        // large image is never cut off while it streams.
        const res = await startsWithin(deps.fetchFn(url), deps.storageTimeoutMs ?? 8000);
        if (res.ok) return res;
        // Not there (yet), or refused: let the gateway answer.
        release(res);
      } catch {
        /* storage unreachable or too slow from here: fall through to the gateway */
      }
    }
  }
  return deps.viaGateway();
}
