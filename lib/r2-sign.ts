import "server-only";
import { createHash, createHmac } from "node:crypto";

/**
 * Minimal AWS SigV4 presigner for Cloudflare R2.
 *
 * Hand-rolled rather than using `@aws-sdk/s3-request-presigner` because the
 * only thing needed is a presigned GET, and that is ~60 lines against a
 * dependency that pulls in a large tree. It runs on Vercel's Node runtime
 * with nothing but `node:crypto`.
 *
 * Why R2 rather than Supabase Storage for installers: R2 charges nothing for
 * egress. Supabase's free tier allows 5 GB a month and Pro 250 GB, and a
 * single installer here is 114 MB — 44 downloads would exhaust the free
 * allowance. Installers are the exact workload R2's pricing exists for.
 *
 * Presigned URLs are capabilities: whoever holds one can read that object
 * until it expires, with no credentials. They are minted per request, handed
 * to one browser, and never logged.
 */

export interface R2Config {
  /** e.g. https://<account>.r2.cloudflarestorage.com */
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** R2 ignores region but SigV4 requires one in the credential scope. */
  region: string;
}

/**
 * Reads the download-storage config from the environment.
 *
 * Returns null when unset, which is what lets the download route fall back
 * to Supabase Storage rather than failing — during the migration both paths
 * have to work.
 */
export function r2DownloadsConfig(): R2Config | null {
  const endpoint = process.env.R2_DOWNLOADS_ENDPOINT;
  const accessKeyId = process.env.R2_DOWNLOADS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_DOWNLOADS_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    accessKeyId,
    secretAccessKey,
    bucket: process.env.R2_DOWNLOADS_BUCKET || "video-api",
    region: process.env.R2_DOWNLOADS_REGION || "auto",
  };
}

/** Prefix inside the bucket. Keeps installers apart from the other tenants. */
export function r2DownloadsPrefix(): string {
  return (process.env.R2_DOWNLOADS_PREFIX || "downloads").replace(
    /^\/+|\/+$/g,
    ""
  );
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

/**
 * Percent-encode one path segment per RFC 3986.
 *
 * `encodeURIComponent` leaves `!'()*` alone; SigV4 requires them encoded, and
 * a mismatch between what we sign and what the client sends is a signature
 * error that looks like a credentials problem.
 */
function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export interface PresignOptions {
  /** Seconds the URL stays valid. */
  expiresIn: number;
  /**
   * Filename to force as a download. Sets response-content-disposition so
   * the browser saves the file instead of trying to render it.
   */
  downloadAs?: string;
}

/**
 * Presign a GET for one object.
 *
 * Query-string signing (not headers) so the URL works in a bare browser
 * navigation, which is what the download route 302s into.
 */
export function presignR2Get(
  config: R2Config,
  objectKey: string,
  options: PresignOptions
): string {
  return presign(config, "GET", objectKey, options);
}

/**
 * Presign a PUT, so a browser can upload one object straight to the bucket.
 *
 * Only `host` is signed, so the browser may send any Content-Type. The bucket's
 * CORS rule has to allow PUT from the site's origin.
 */
export function presignR2Put(
  config: R2Config,
  objectKey: string,
  options: { expiresIn: number }
): string {
  return presign(config, "PUT", objectKey, options);
}

function presign(
  config: R2Config,
  method: "GET" | "PUT",
  objectKey: string,
  options: PresignOptions
): string {
  const url = new URL(config.endpoint);
  const host = url.host;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${config.region}/s3/aws4_request`;

  const canonicalUri =
    "/" +
    [config.bucket, ...objectKey.split("/")].map(encodeSegment).join("/");

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(options.expiresIn),
    "X-Amz-SignedHeaders": "host",
  });
  if (options.downloadAs) {
    query.set(
      "response-content-disposition",
      `attachment; filename="${options.downloadAs.replace(/"/g, "")}"`
    );
  }
  // SigV4 signs the query in sorted order.
  query.sort();

  // URLSearchParams serialises to application/x-www-form-urlencoded, which
  // writes a space as "+". SigV4 requires "%20". The difference only shows up
  // once a value contains a space — here, the `attachment; filename=...`
  // disposition — and it fails as SignatureDoesNotMatch, which reads like bad
  // credentials rather than bad encoding.
  const canonicalQuery = query.toString().replace(/\+/g, "%20");

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  let signing = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  signing = hmac(signing, config.region);
  signing = hmac(signing, "s3");
  signing = hmac(signing, "aws4_request");
  const signature = createHmac("sha256", signing)
    .update(stringToSign)
    .digest("hex");

  // Must be the byte-identical query that was signed.
  return `${url.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
