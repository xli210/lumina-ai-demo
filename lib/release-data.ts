import { ImagePlus, Video, Wand2, ScanFace, ArrowLeftRight, Palette, Shirt, Sparkles, type LucideIcon } from "lucide-react";

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
    app: "Nano FaceStudio Pro",
    slug: "nano-facestudio-pro",
    icon: Palette,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.2",
        date: "October 12, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Faster: the AI model now loads in the background as soon as the app opens, so the first face swap, upscale or head swap no longer waits about 30\u201340 seconds" },
          { type: "improvement", text: "Result images save faster, and first-time setup downloads faster on most connections (4 connections per file)" },
          { type: "improvement", text: "Old results (older than 7 days) and old log files are cleaned up automatically" },
          { type: "improvement", text: "Tighter app security: app windows can only open the app\u2019s own pages" },
        ],
      },
      {
        version: "1.0.1",
        date: "October 2026",
        changes: [
          { type: "improvement", text: "Installer and app are now code-signed by NanoPocket AI LLC, so antivirus warnings are reduced" },
          { type: "fix", text: "Fixed setup getting stuck forever when the internet dropped during the download; every downloaded file is now verified before it is installed" },
          { type: "improvement", text: "Checks your GPU, driver and free disk space before the large download, with a clear message if something is missing" },
          { type: "improvement", text: "Your activation now survives Windows updates, renaming your PC and hardware changes, and offline use has a proper grace period instead of logging you out after one failed check" },
          { type: "fix", text: "If the model files or your activation can\u2019t be read, the app repairs itself or asks for your key again; only one copy runs at a time and the AI engine always shuts down when you close the app" },
          { type: "improvement", text: "Uninstalling removes everything; updating keeps all your data" },
        ],
      },
    ],
  },
  {
    app: "Nano ImageEdit",
    slug: "nano-imageedit",
    icon: ImagePlus,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "1.0.6",
        date: "October 14, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Code-signed installer, so antivirus warnings are reduced" },
          { type: "improvement", text: "About 8 GB smaller download and about 16 GB less disk space" },
          { type: "improvement", text: "Downloads resume after an interruption and are verified" },
          { type: "improvement", text: "Much faster generation on graphics cards with 8\u201316 GB of memory" },
          { type: "improvement", text: "Your first image is as fast as the rest" },
          { type: "improvement", text: "Clear error messages instead of crashes" },
          { type: "improvement", text: "Works with proxy and VPN tools turned on" },
          { type: "fix", text: "Fixed offline license checks and trial licenses" },
          { type: "improvement", text: "Uninstalling removes everything; updating keeps your data" },
        ],
      },
      {
        version: "1.0.5",
        date: "March 19, 2026",
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
        version: "1.0.3",
        date: "October 12, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Installer and app are now code-signed by NanoPocket AI LLC, so antivirus warnings are reduced" },
          { type: "improvement", text: "PCs without a supported NVIDIA GPU (RTX 50-series, older cards, outdated drivers) now run on the CPU automatically instead of showing a CUDA error" },
          { type: "improvement", text: "New default install location, avoiding problems caused by OneDrive and Windows ransomware protection; existing installs stay where they are" },
          { type: "improvement", text: "Downloads resume after a dropped connection and are verified before installing; free disk space is checked first, and a half-finished model download is no longer treated as complete" },
          { type: "improvement", text: "Uninstalling now removes everything (about 5.5 GB used to be left behind); updating keeps your data" },
          { type: "fix", text: "Phone photos are now shown the right way up" },
          { type: "improvement", text: "Your activation now survives Windows updates, renaming your PC and hardware changes; licenses are re-checked online every 14 days, with up to 30 days of offline use" },
          { type: "fix", text: "If the app can\u2019t start, it now shows the reason instead of closing silently" },
        ],
      },
      {
        version: "1.0.2",
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
        version: "1.0.6",
        date: "October 11, 2026",
        tag: "Latest",
        changes: [
          { type: "improvement", text: "Installer and all program files are now digitally signed (publisher: NanoPocket AI LLC), reducing antivirus false positives" },
          { type: "improvement", text: "Desktop shortcut is created by default" },
        ],
      },
      {
        version: "1.0.5",
        date: "October 9, 2026",
        changes: [
          { type: "fix", text: "Fixed corrupted model files after an interrupted download" },
          { type: "fix", text: "Fixed the model loading twice on first launch, which doubled memory use" },
          { type: "improvement", text: "Setup now checks your GPU, driver version and free disk space before downloading" },
          { type: "improvement", text: "Clear error messages when the GPU is unsupported or the driver is outdated" },
          { type: "fix", text: "Fixed license verification issues on recent Windows 11 versions" },
          { type: "improvement", text: "Default install location moved to AppData\\Local\\Programs to avoid OneDrive sync" },
          { type: "improvement", text: "Cleaner uninstall" },
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
    icon: Sparkles,
    gradient: "from-primary to-blue-400",
    releases: [
      {
        version: "3.0.0",
        date: "April 22, 2026",
        tag: "Grand Release",
        changes: [
          { type: "feature", text: "Brand-new Electron desktop app — silky-smooth UI with instant responsiveness" },
          { type: "feature", text: "Native macOS support for Apple Silicon (M2, M3, M4, M5)" },
          { type: "feature", text: "Batch processing — drop in an entire folder and let it run" },
          { type: "feature", text: "Crop tool with high-precision selection" },
          { type: "feature", text: "AI background matting — clean cutouts, transparent PNG export" },
          { type: "improvement", text: "Faster, more memory-efficient inference pipeline" },
          { type: "improvement", text: "Refreshed launch page with light, dark, and black themes" },
        ],
      },
      {
        version: "1.0.5",
        date: "March 27, 2026",
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
        version: "1.0.1",
        date: "October 14, 2026",
        tag: "Latest",
        changes: [
          { type: "fix", text: "Fixed the app not opening on new installs" },
          { type: "improvement", text: "Code-signed installer, so antivirus warnings are reduced" },
          { type: "improvement", text: "1.9 GB smaller download; the app now works fully offline" },
          { type: "improvement", text: "Downloads resume after an interruption and are verified" },
          { type: "improvement", text: "Faster: the model stays loaded between try-ons" },
          { type: "fix", text: "\u201cSegmentation-free mode\u201d and \u201cCancel\u201d now work" },
          { type: "improvement", text: "Clear message on PCs without a supported NVIDIA graphics card" },
          { type: "improvement", text: "Uninstalling removes everything; updating keeps your data" },
        ],
      },
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
