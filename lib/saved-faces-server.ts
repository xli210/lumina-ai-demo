import "server-only";
import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { presignR2Delete, presignR2Get, presignR2Put, r2DownloadsConfig, type R2Config } from "@/lib/r2-sign";

/**
 * "My faces": reference photos a person chose to keep, so the next swap in Nano FaceStudio Online or Nano HeadSwap Pro starts
 * with one click instead of an upload. Saved only on request, after a sentence that says the photo is kept privately until the
 * person deletes it (the `consented_at` of the row). Deleting one removes the row and both files.
 *
 * The files sit in the R2 bucket the site already signs for, under saved-faces/<user id>/: the photo as the browser prepared
 * it (a JPEG, long side at most SAVED_FACE_MAX_SIDE) and a small thumbnail for the list. The browser uploads both to signed
 * addresses; the site then checks they are there before the face is listed. Table: scripts/028_create_saved_faces.sql.
 *
 * Picking a face streams the photo through /api/saved-faces/<id>/image (same origin, so the page can read it as a file and
 * upload it through the tool's normal path, untouched). The list shows thumbnails from signed storage links, which an <img>
 * can load from another origin.
 */

export const SAVED_FACES_MAX = 20;
/** Longest side of the saved photo, in pixels; the browser resizes before uploading. Plenty for a face reference. */
export const SAVED_FACE_MAX_SIDE = 2048;
/** Largest accepted photo, after the browser's resize. */
export const SAVED_FACE_MAX_BYTES = 8 * 1024 * 1024;
export const SAVED_FACE_THUMB_MAX_BYTES = 512 * 1024;
const UPLOAD_TTL_SECONDS = 10 * 60;
const THUMB_LINK_TTL_SECONDS = 60 * 60;
/** Rows whose upload never finished are dropped after this long. */
const PENDING_TTL_MS = 24 * 3600 * 1000;

export const SAVED_FACE_SOURCES = ["facestudio", "headswap-pro"] as const;
export type SavedFaceSource = (typeof SAVED_FACE_SOURCES)[number];

export function isSavedFaceSource(v: unknown): v is SavedFaceSource {
  return typeof v === "string" && (SAVED_FACE_SOURCES as readonly string[]).includes(v);
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function isSavedFaceId(v: unknown): v is string {
  return typeof v === "string" && ID.test(v);
}

interface Row {
  id: string;
  user_id: string;
  object_key: string;
  thumb_key: string;
  confirmed_at: string | null;
  created_at: string;
  last_used_at: string | null;
  use_count: number;
}

export interface SavedFace {
  id: string;
  /** Signed storage link to the thumbnail, valid for an hour. */
  thumb: string;
  /** Same-origin address of the photo, to read as a file. */
  image: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function storage(): R2Config {
  const config = r2DownloadsConfig();
  if (!config) throw new Error("face storage is not configured");
  return config;
}

function prefixOf(userId: string): string {
  return `saved-faces/${userId}`;
}

/** Bytes of a stored object, or null when it is not there. Reads one byte, not the file. */
async function storedSize(key: string): Promise<number | null> {
  const r = await fetch(presignR2Get(storage(), key, { expiresIn: 120 }), {
    headers: { Range: "bytes=0-0" },
    cache: "no-store",
    signal: AbortSignal.timeout(6_000),
  });
  await r.body?.cancel().catch(() => undefined);
  if (!r.ok) return null;
  const total = /\/(\d+)$/.exec(r.headers.get("content-range") ?? "")?.[1];
  const n = Number(total ?? r.headers.get("content-length") ?? NaN);
  return Number.isFinite(n) ? n : null;
}

async function removeObject(key: string): Promise<void> {
  const r = await fetch(presignR2Delete(storage(), key, { expiresIn: 120 }), {
    method: "DELETE",
    cache: "no-store",
    signal: AbortSignal.timeout(6_000),
  });
  await r.body?.cancel().catch(() => undefined);
  // 204 when deleted; R2 also answers 204 for a key that was never there.
  if (!r.ok && r.status !== 404) throw new Error(`storage refused the delete (${r.status})`);
}

async function removeRow(row: Pick<Row, "id" | "object_key" | "thumb_key">): Promise<void> {
  // Files first: a row without files is harmless, files without a row could not be found again to delete.
  await removeObject(row.object_key);
  await removeObject(row.thumb_key);
  const { error } = await createAdminClient().from("saved_faces").delete().eq("id", row.id);
  if (error) throw new Error(`Failed to delete the face: ${error.message}`);
}

export async function listSavedFaces(userId: string): Promise<SavedFace[]> {
  const { data, error } = await createAdminClient()
    .from("saved_faces")
    .select("id, user_id, object_key, thumb_key, confirmed_at, created_at, last_used_at, use_count")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(SAVED_FACES_MAX + 10);
  if (error) throw new Error(`Failed to list saved faces: ${error.message}`);
  const rows = (data ?? []) as Row[];

  const stale = rows.filter((r) => !r.confirmed_at && Date.now() - Date.parse(r.created_at) > PENDING_TTL_MS);
  await Promise.all(
    stale.map((r) =>
      removeRow(r).catch((err: unknown) => console.error("[saved-faces] dropping an unfinished save failed:", err instanceof Error ? err.message : err))
    )
  );

  const config = storage();
  return rows
    .filter((r) => r.confirmed_at)
    .map((r) => ({
      id: r.id,
      thumb: presignR2Get(config, r.thumb_key, { expiresIn: THUMB_LINK_TTL_SECONDS }),
      image: `/api/saved-faces/${r.id}/image`,
      createdAt: r.created_at,
      lastUsedAt: r.last_used_at,
    }));
}

export type StartSaveResult =
  | { ok: true; id: string; uploadUrl: string; thumbUploadUrl: string }
  | { ok: false; status: number; detail: string; reason?: "limit" };

/** Writes the row (not yet listed) and returns where the browser uploads the photo and its thumbnail. */
export async function startSave(
  userId: string,
  input: { source: SavedFaceSource; width?: number; height?: number }
): Promise<StartSaveResult> {
  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("saved_faces")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("confirmed_at", "is", null);
  if (countError) throw new Error(`Failed to count saved faces: ${countError.message}`);
  if ((count ?? 0) >= SAVED_FACES_MAX) {
    return {
      ok: false,
      status: 409,
      reason: "limit",
      detail: `You have saved ${SAVED_FACES_MAX} faces, the most there is room for. Delete one to save another.`,
    };
  }

  const id = randomUUID();
  const objectKey = `${prefixOf(userId)}/${id}.jpg`;
  const thumbKey = `${prefixOf(userId)}/${id}_t.jpg`;
  const dim = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 20000 ? v : null);
  const { error } = await admin.from("saved_faces").insert({
    id,
    user_id: userId,
    object_key: objectKey,
    thumb_key: thumbKey,
    width: dim(input.width),
    height: dim(input.height),
    source: input.source,
  });
  if (error) throw new Error(`Failed to start saving the face: ${error.message}`);

  const config = storage();
  return {
    ok: true,
    id,
    uploadUrl: presignR2Put(config, objectKey, { expiresIn: UPLOAD_TTL_SECONDS }),
    thumbUploadUrl: presignR2Put(config, thumbKey, { expiresIn: UPLOAD_TTL_SECONDS }),
  };
}

async function ownRow(userId: string, id: string): Promise<Row | null> {
  const { data, error } = await createAdminClient()
    .from("saved_faces")
    .select("id, user_id, object_key, thumb_key, confirmed_at, created_at, last_used_at, use_count")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Failed to read the face: ${error.message}`);
  return (data as Row | null) ?? null;
}

export type ConfirmResult = { ok: true; face: SavedFace } | { ok: false; status: number; detail: string };

/** After the browser's uploads: checks both files are there and not too big, then lists the face. */
export async function confirmSave(userId: string, id: string): Promise<ConfirmResult> {
  const row = await ownRow(userId, id);
  if (!row) return { ok: false, status: 404, detail: "That face was not found." };
  const [bytes, thumbBytes] = await Promise.all([storedSize(row.object_key), storedSize(row.thumb_key)]);
  if (bytes === null || thumbBytes === null) {
    return { ok: false, status: 409, detail: "The photo did not finish uploading. Try again." };
  }
  if (bytes > SAVED_FACE_MAX_BYTES || thumbBytes > SAVED_FACE_THUMB_MAX_BYTES) {
    await removeRow(row);
    return { ok: false, status: 413, detail: "That photo is too large to save." };
  }
  const { error } = await createAdminClient()
    .from("saved_faces")
    .update({ confirmed_at: new Date().toISOString(), bytes })
    .eq("id", row.id);
  if (error) throw new Error(`Failed to save the face: ${error.message}`);
  return {
    ok: true,
    face: {
      id: row.id,
      thumb: presignR2Get(storage(), row.thumb_key, { expiresIn: THUMB_LINK_TTL_SECONDS }),
      image: `/api/saved-faces/${row.id}/image`,
      createdAt: row.created_at,
      lastUsedAt: null,
    },
  };
}

export async function deleteSavedFace(userId: string, id: string): Promise<boolean> {
  const row = await ownRow(userId, id);
  if (!row) return false;
  await removeRow(row);
  return true;
}

/** The photo, from storage, for the owner only. Counts as a use: picking a face is the only reason to read it. */
export async function savedFaceImage(userId: string, id: string): Promise<Response | null> {
  const row = await ownRow(userId, id);
  if (!row || !row.confirmed_at) return null;
  const res = await fetch(presignR2Get(storage(), row.object_key, { expiresIn: 120 }), {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    await res.body?.cancel().catch(() => undefined);
    return null;
  }
  void createAdminClient()
    .from("saved_faces")
    .update({ last_used_at: new Date().toISOString(), use_count: (row.use_count ?? 0) + 1 })
    .eq("id", row.id)
    .then(({ error }) => {
      if (error) console.error("[saved-faces] recording a use failed:", error.message);
    });
  return res;
}
