import { FACESTUDIO_V_LAUNCH } from "@/lib/facestudio-v";

/** The online tools, in the order offered: video first, because that is what most people try and what buyers use. */
export type StartToolId = "video" | "head" | "face" | "edit";

export const START_TOOLS: readonly { id: StartToolId; href: string; from: boolean }[] = [
  { id: "video", href: FACESTUDIO_V_LAUNCH, from: true },
  { id: "head", href: "/headswap-pro/index.html", from: false },
  { id: "face", href: "/face-studio/launch", from: true },
  { id: "edit", href: "/image-edit/launch", from: false },
];

export const START_PATH = "/start";
