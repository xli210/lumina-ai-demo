import { ImagePlus, Video, Wand2, ScanFace, ArrowLeftRight, Shirt, Sparkles, type LucideIcon } from "lucide-react";

export interface ReleaseChange {
  type: "feature" | "improvement" | "fix";
  text: string;
}

export interface Release {
  version: string;
  date: string;
  tag?: string;
  changes: ReleaseChange[];
}

export interface AppRelease {
  app: string;
  slug: string;
  icon: LucideIcon;
  gradient: string;
  releases: Release[];
}

export const appReleases: AppRelease[] = [
  {
    app: "Nano ImageEdit",
    slug: "nano-imageedit",
    icon: ImagePlus,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.5",
        date: "March 19, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.4",
        date: "March 16, 2026",
        changes: [
          { type: "improvement", text: "General stability and performance improvements" },
          { type: "fix", text: "Bug fixes and optimizations" },
        ],
      },
      {
        version: "1.0.2",
        date: "March 4, 2026",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "Enhanced transport-key encryption for security" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.1",
        date: "February 28, 2026",
        changes: [
          { type: "feature", text: "Text-to-image generation from text prompts" },
          { type: "feature", text: "Image-to-image generation with reference photos" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Streaming DiT mode for GPUs with less than 12 GB VRAM" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano VideoGen",
    slug: "nano-videogen",
    icon: Video,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.1.2",
        date: "March 18, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.1.0",
        date: "March 18, 2026",
        changes: [
          { type: "feature", text: "Improved video quality and motion consistency" },
          { type: "improvement", text: "Faster generation with optimized inference pipeline" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.3",
        date: "March 4, 2026",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.2",
        date: "February 27, 2026",
        changes: [
          { type: "improvement", text: "Rebranded to Nano VideoGen with new installer" },
          { type: "feature", text: "Text-to-video generation with advanced AI models" },
          { type: "feature", text: "Image-to-video generation with structural control" },
          { type: "feature", text: "Keyframe interpolation — morph between two images" },
          { type: "feature", text: "Camera control LoRAs (dolly in/out/left/right, jib up/down, static)" },
          { type: "feature", text: "Spatial upscaler for 2× resolution boost" },
          { type: "feature", text: "Smart VRAM management for GPUs with limited memory" },
          { type: "feature", text: "Product-bound license activation" },
        ],
      },
    ],
  },
  {
    app: "Nano VideoEnhance",
    slug: "nano-videoenhance",
    icon: Wand2,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.5",
        date: "March 21, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.4",
        date: "March 21, 2026",
        changes: [
          { type: "improvement", text: "Optimized processing speed for NVIDIA GPU users" },
          { type: "fix", text: "Fixed color bleeding artifacts during enhancement" },
          { type: "feature", text: "Added friendly video comparison view (before/after)" },
        ],
      },
      {
        version: "1.0.1",
        date: "March 18, 2026",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 18, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered video upscaling and enhancement" },
          { type: "feature", text: "Video stabilization and denoising" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
          { type: "feature", text: "Product-bound license activation" },
        ],
      },
    ],
  },
  {
    app: "Nano FacialEdit",
    slug: "nano-facialedit",
    icon: ScanFace,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.2",
        date: "March 16, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "General stability and performance improvements" },
          { type: "fix", text: "Bug fixes and optimizations" },
        ],
      },
      {
        version: "1.0.1",
        date: "March 5, 2026",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 3, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered facial retouching and enhancement" },
          { type: "feature", text: "Face swap and expression editing" },
          { type: "feature", text: "Portrait enhancement with natural results" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano FaceSwap",
    slug: "nano-faceswap",
    icon: ArrowLeftRight,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.4",
        date: "March 25, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.3",
        date: "March 16, 2026",
        changes: [
          { type: "improvement", text: "General stability and performance improvements" },
          { type: "fix", text: "Bug fixes and optimizations" },
        ],
      },
      {
        version: "1.0.1",
        date: "March 5, 2026",
        changes: [
          { type: "improvement", text: "Updated installer with latest fixes and improvements" },
          { type: "improvement", text: "General stability and performance improvements" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 4, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered face swapping in photos and videos" },
          { type: "feature", text: "Realistic and natural-looking results" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano ImageEnh",
    slug: "nano-imageenh",
    icon: Wand2,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.5",
        date: "March 27, 2026",
        tag: "Latest",
        changes: [
          { type: "feature", text: "Interface color themes — dark, white, and black modes on the launch page" },
          { type: "feature", text: "Batch processing — select a single image or an entire folder to process" },
        ],
      },
      {
        version: "1.0.4",
        date: "March 25, 2026",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.3",
        date: "March 19, 2026",
        changes: [
          { type: "improvement", text: "Bug fixes and stability improvements" },
          { type: "improvement", text: "General performance optimizations" },
        ],
      },
      {
        version: "1.0.1",
        date: "March 16, 2026",
        changes: [
          { type: "improvement", text: "General stability and performance improvements" },
          { type: "fix", text: "Bug fixes and optimizations" },
        ],
      },
      {
        version: "1.0.0",
        date: "March 5, 2026",
        changes: [
          { type: "feature", text: "AI-powered image upscaling and denoising" },
          { type: "feature", text: "Photo restoration and detail enhancement" },
          { type: "feature", text: "Product-bound license activation for secure model protection" },
          { type: "feature", text: "7-day free trial included" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
  {
    app: "Nano ImageTryon",
    slug: "nano-imagetryon",
    icon: Shirt,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.0",
        date: "March 16, 2026",
        tag: "Initial Release",
        changes: [
          { type: "feature", text: "AI-powered virtual try-on with photo-realistic results" },
          { type: "feature", text: "Clothing swap from any photo" },
          { type: "feature", text: "Runs 100% locally on your GPU — no cloud dependency" },
        ],
      },
    ],
  },
];
