/**
 * Prose about which online demos can be used right now, derived from the
 * `maintenance` flags in lib/demos.ts.
 *
 * Every page and every LLM-facing file that says how many demos there are, or
 * which ones work, takes its wording from here. Before this existed the count
 * was written into ~20 places as "three free online demos", and when two of the
 * three went offline on 2026-09-28 all of them kept saying so: assistants
 * quoted the claim, and the visitors they sent landed on a maintenance page.
 *
 * Copy that does not need a count should not use one. These helpers are for
 * the places that list demos or must say which are offline. Status changes
 * only with a deploy (the flags are code), so build-time rendering is fine.
 */

import {
  DEMOS,
  isUnderMaintenance,
  liveDemos,
  type DemoEntry,
} from "@/lib/demos";

/** Shown in place of the registry name for the demo Nano FaceStudio Online replaced. */
const DISPLAY_NAME: Partial<Record<DemoEntry["id"], string>> = {
  image: "Nano FaceStudio Online (formerly Image FaceSwap Pro 2.0)",
};
const DISPLAY_NAME_ZH: Partial<Record<DemoEntry["id"], string>> = {
  image: "Nano FaceStudio Online（原 Image FaceSwap Pro 2.0）",
};

function displayName(d: DemoEntry): string {
  return DISPLAY_NAME[d.id] ?? d.name;
}

function displayNameZh(d: DemoEntry): string {
  return DISPLAY_NAME_ZH[d.id] ?? d.name;
}

function offlineDemos(): DemoEntry[] {
  return DEMOS.filter(isUnderMaintenance);
}

function joinEn(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Earliest `maintenance.since` among offline demos, or null. */
function offlineSince(): string | null {
  const dates = offlineDemos()
    .map((d) => d.maintenance!.since)
    .sort();
  return dates[0] ?? null;
}

/**
 * One or two sentences: what can be used today, and what is offline since
 * when. Safe to drop into any paragraph, llms.txt bullet, or JSON-LD string.
 *
 * e.g. "Nano FaceStudio Online (formerly Image FaceSwap Pro 2.0) is live. Video FaceSwap
 * Pro and NanoFace Vivid are temporarily offline since 2026-09-28 while they
 * move to NanoPocket's own GPU infrastructure."
 */
export function demoAvailabilityEn(): string {
  const live = liveDemos().map(displayName);
  const off = offlineDemos().map((d) => d.name);

  const liveSentence =
    live.length === 0
      ? "No online demo is available right now."
      : `${joinEn(live)} ${live.length === 1 ? "is" : "are"} live.`;

  if (off.length === 0) return liveSentence;

  return `${liveSentence} ${joinEn(off)} ${
    off.length === 1 ? "is" : "are"
  } temporarily offline since ${offlineSince()} while ${
    off.length === 1 ? "it moves" : "they move"
  } to NanoPocket's own GPU infrastructure.`;
}

export function demoAvailabilityZh(): string {
  const live = liveDemos().map(displayNameZh);
  const off = offlineDemos().map((d) => d.name);

  const liveSentence =
    live.length === 0 ? "目前没有可用的在线演示。" : `${live.join("、")}现已上线。`;

  if (off.length === 0) return liveSentence;

  return `${liveSentence}${off.join("、")}自 ${offlineSince()} 起暂时下线，正在迁移到 NanoPocket 自有的 GPU 基础设施。`;
}

/** Status of a single demo, for per-product copy. */
export function demoStatusEn(id: DemoEntry["id"]): string {
  const d = DEMOS.find((x) => x.id === id);
  if (!d) return "";
  if (!isUnderMaintenance(d)) return "Online demo available now.";
  return `Online demo temporarily offline since ${d.maintenance!.since} while it moves to NanoPocket's own GPU infrastructure; see /status.`;
}
