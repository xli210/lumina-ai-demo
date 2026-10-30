/**
 * The homepage FAQ. Shared by the visible accordion (faq-section.tsx, a client component) and the
 * FAQPage structured data in app/page.tsx, so the two can never say different things.
 */
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE } from "@/lib/headswap-pro";
import { IMAGEEDIT_CREDITS_PER_EDIT } from "@/lib/imageedit";

/** What the sign-up grant buys, so "free" always comes with a number that matches billing. */
export const FREE_FACE_SWAPS = Math.floor(SIGNUP_GRANT_CREDITS / FACE_SWAP_CREDITS);
const FREE_HEADSWAPS = Math.floor(SIGNUP_GRANT_CREDITS / HEADSWAP_PRO_CREDITS_PER_IMAGE);
const FREE_EDITS = Math.floor(SIGNUP_GRANT_CREDITS / IMAGEEDIT_CREDITS_PER_EDIT);

export const HOME_FAQS: readonly { question: string; answer: string }[] = [
  {
    question: "Is NanoPocket free?",
    answer: `Yes, it is free to start. Every new account gets ${SIGNUP_GRANT_CREDITS} free credits, enough for ${FREE_FACE_SWAPS} photo face swaps (${FACE_SWAP_CREDITS} credits each), ${FREE_HEADSWAPS} Nano HeadSwap Pro images or ${FREE_EDITS} AI photo edits, and no card is needed to sign up. Three desktop apps are free for good: Nano FaceSwap, Nano FacialEdit and Nano ImageTryon; the paid desktop apps have a 7-day free trial. After the free credits you top up only when you need more, with no subscription. Face, head and video swaps made before your first purchase carry a NanoPocket watermark.`,
  },
  {
    question: "Can I try it without downloading anything?",
    answer:
      "Yes. Four tools run in your browser: Nano FaceStudio Online swaps up to six faces in one photo, Nano HeadSwap Pro puts a whole new head (face and hair) into a photo, Video FaceSwap Online swaps a face or head in a video, and Nano ImageEdit 2.0 Online edits a photo by describing the change. They need only a free account; new accounts start with free credits, and failed jobs are refunded. The desktop apps are for working offline on your own GPU.",
  },
  {
    question: "What GPU do I need to run these apps?",
    answer:
      "An NVIDIA GPU with a minimum of 8 GB VRAM is required to run most applications. Only CUDA-enabled GPUs are currently supported. For optimal performance: Video Generation requires 16 GB+ VRAM; Image Generation, Image Editing & Video Enhancement require 10 GB+ VRAM. Nano ImageEnh Pro 3.0 also has a native Apple Silicon build; other Mac apps and AMD GPU support are on the roadmap. The online tools need no GPU at all.",
  },
  {
    question: "Is my data really private?",
    answer:
      "On the desktop apps, yes: all AI processing happens on your own machine and your images and videos never leave it. Only a license-activation handshake is sent. The online tools work differently: your photo or video is sent to a NanoPocket-hosted GPU for the length of the job and is not used to train any model. The /trust page has the full privacy summary.",
  },
  {
    question: "Do I need an internet connection?",
    answer:
      "For the desktop apps, only for the initial setup: downloading the app, activating your license, and downloading AI models. After that, everything runs completely offline. Perfect for air-gapped environments and fieldwork.",
  },
  {
    question: "How does the licensing work?",
    answer:
      "Each license key activates on one machine. Free products give you a permanent license at no cost. Paid products offer a 7-day free trial, after which you can purchase a one-time lifetime license — no subscriptions ever.",
  },
  {
    question: "Can I switch my license to a new computer?",
    answer:
      "Yes. You can deactivate your license from the current machine and reactivate it on a new one. If you no longer have access to the old machine, you can use the force-takeover option (available once every 30 days) to transfer your license.",
  },
  {
    question: "What operating systems are supported?",
    answer:
      "The desktop apps run on Windows 10/11 (64-bit) with an NVIDIA CUDA GPU. Nano ImageEnh Pro 3.0 also ships a native Apple Silicon build; other Mac apps and Linux are on the roadmap. The online tools run in any modern browser on any system.",
  },
  {
    question: "Are updates really free forever?",
    answer:
      "Yes. Every license — free or paid — includes lifetime updates. As we release new AI models, features, and performance improvements, you get them automatically at no extra cost.",
  },
  {
    question: "What if I need help or have a problem?",
    answer:
      "You can reach us through the contact form on our website or via email. We typically respond within 24 hours. Our community also shares tips and solutions in our online forums.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Many of our applications are free to download and use at no cost. For paid applications, we offer a 7-day free trial so you can fully explore the app before committing to a purchase. Because of this, we do not offer refunds after a purchase is made. Once purchased, you own the application permanently with no recurring fees. We encourage you to take full advantage of the free trial period to ensure the app meets your needs before buying.",
  },
];
