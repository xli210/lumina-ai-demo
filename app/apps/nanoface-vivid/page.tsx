import type { Metadata } from "next";
import { VividLanding } from "./vivid-landing";
import { PAGE_URL, LAST_VERIFIED } from "./data";

export const metadata: Metadata = {
  title: "NanoFace Vivid — Fix Over-Smoothed AI Faces from Gemini, Firefly, and Face Swap",
  description:
    "NanoFace Vivid is a face-detail restorer that fixes the plastic, over-smoothed look that Google Gemini 2.5 Flash Image (Nano Banana), Adobe Firefly, Roop, FaceFusion, and cloud face-swap services leave on portraits. Online demo today, integrating into NanoPocket FaceSwap Pro 2.0 desktop app soon.",
  keywords: [
    "nanoface vivid",
    "fix gemini ai face",
    "remove ai face plastic look",
    "fix over smoothed face ai",
    "nano banana face fix",
    "face swap detailer",
    "ai face skin texture",
    "make ai face realistic",
    "remove ai taste from face",
    "face swap pro 2.0 vivid",
  ],
  alternates: { canonical: "/apps/nanoface-vivid" },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "NanoFace Vivid — fix the AI taste in over-smoothed faces",
    description:
      "Restore pores, lashes, lighting variance, and color depth on portraits flattened by Gemini, Firefly, or any face-swap pipeline. Coming to NanoPocket FaceSwap Pro 2.0.",
    images: ["/images/vivid/gemini-after.jpg"],
  },
  other: {
    "article:modified_time": LAST_VERIFIED,
  },
};

export default function Page() {
  return <VividLanding />;
}
