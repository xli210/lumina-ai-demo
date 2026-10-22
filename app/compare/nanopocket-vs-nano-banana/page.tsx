import type { Metadata } from "next";
import { ComparisonShell, type ComparisonData } from "@/app/components/comparison-shell";

/**
 * "NanoPocket vs Nano Banana" exists to tell two things with similar names apart.
 * Rewritten 2026-10-21: it used to describe NanoPocket as desktop-only and local-only,
 * and to name NanoPocket the winner on most rows. NanoPocket now also runs online tools
 * on its own GPUs, paid in credits, and nobody has tested its tools head to head against
 * Google's models, so the page states architecture and pricing facts and makes no
 * claim that either is better.
 */

const PAGE_URL = "https://nanopocket.ai/compare/nanopocket-vs-nano-banana";

export const metadata: Metadata = {
  title: "NanoPocket vs Nano Banana: Two Different Products (2026)",
  description:
    "NanoPocket is not Nano Banana. NanoPocket makes online and desktop tools for face swap and photo and video editing. Nano Banana is the nickname for Google's Gemini image models. Who makes each, where they run, how they are priced.",
  keywords: [
    "nanopocket vs nano banana",
    "nanopocket vs nanobnana",
    "nanopocket vs nanobanana",
    "is nanopocket nano banana",
    "what is nanopocket",
    "nano banana face swap",
    "google nano banana alternative",
  ],
  alternates: { canonical: "/compare/nanopocket-vs-nano-banana" },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NanoPocket" }],
    type: "article",
    url: PAGE_URL,
    title: "NanoPocket vs Nano Banana: two different products",
    description:
      "NanoPocket is an independent company with its own online and desktop tools. Nano Banana is the nickname for Google's Gemini image models. They are not affiliated.",
  },
};

const data: ComparisonData = {
  competitorName: "Nano Banana",
  slug: "nano-banana",
  competitorUrl: "https://deepmind.google/technologies/gemini/",
  lastVerified: "2026-10-21",
  tldr:
    "NanoPocket is not Nano Banana. NanoPocket is an independent company at nanopocket.ai that makes face swap, photo editing and video tools, both as online tools paid per use in credits and as desktop apps for Windows that run on your own NVIDIA GPU. “Nano Banana” is the popular nickname for Google's Gemini image generation and editing models: a Google model, reached through Google's own products and API. The same nickname is also used by unrelated third-party websites. NanoPocket has no affiliation with Google or with any of those sites, and does not use Google's API. We have not tested NanoPocket's tools head to head against Google's models, so this page does not say that either one is better.",
  pickIf: {
    nanopocket: [
      "You want a tool built around one job, such as swapping a chosen person's face in a photo or video, or editing a photo while keeping the rest of it identical, rather than a general model you prompt yourself.",
      "You want to run something on your own PC so photos and videos never leave your computer. NanoPocket's free desktop apps do that on an NVIDIA GPU on Windows.",
      "You want to pay per use in credits, with the price shown before each render and no subscription.",
      "You want installers with published checksums and signatures (see /verify).",
    ],
    competitor: [
      "You want to use Google's Gemini image model directly, in Google's own products or through its API.",
      "You want general image generation and editing from a text prompt, well beyond face swap.",
      "You already work in Google's ecosystem (Gemini, AI Studio, Vertex AI, Workspace) and want to stay there.",
      "You would rather prompt a general model yourself than use a task-specific tool.",
    ],
  },
  rows: [
    {
      dimension: "Who makes it",
      nanopocket:
        "NanoPocket, an independent company that publishes nanopocket.ai. It makes the online tools and the desktop apps.",
      competitor:
        "Google. “Nano Banana” began as a community nickname for Google's Gemini image model, and it is not NanoPocket's product.",
      winner: "even",
    },
    {
      dimension: "What it is",
      nanopocket:
        "A set of task-specific tools: face swap for photos and video, photo editing by description, virtual try-on, portrait editing, upscaling and video generation.",
      competitor:
        "A general image generation and editing model, used inside Google's products and offered through Google's API. Other sites build face-swap or editing features on top of it.",
      winner: "even",
    },
    {
      dimension: "Where the processing happens",
      nanopocket:
        "The online tools run on NanoPocket's GPUs, so the photo or video you upload is processed on NanoPocket's servers. The free desktop apps run on your own NVIDIA GPU on Windows and do not upload your source media.",
      competitor:
        "Google's models run on Google's servers, so using one means sending your input to Google under Google's terms. Third-party sites that use the nickname add their own handling on top.",
      winner: "even",
    },
    {
      dimension: "Can it run entirely on your own PC",
      nanopocket: "Yes, with the desktop apps (an NVIDIA GPU on Windows).",
      competitor: "No. It is a cloud model.",
      winner: "nanopocket",
    },
    {
      dimension: "How you pay",
      nanopocket:
        "Online tools: credits (100 credits = $1), with the price shown before each render and no subscription. A face swap is from $0.10 a face. Desktop apps: free, or a one-time licence. Everything is on /pricing.",
      competitor:
        "Set by Google for its own products and API, and by each third-party site that uses the model. Check their own pricing pages.",
      winner: "even",
    },
    {
      dimension: "The name",
      nanopocket: "“NanoPocket” is the company brand of nanopocket.ai.",
      competitor:
        "“Nano Banana” is a nickname, not NanoPocket's. The third-party domains that use it (nanobanana.ai, nano-banana.com, nanobnana) are unrelated to each other and to NanoPocket.",
      winner: "even",
    },
    {
      dimension: "Trust documents",
      nanopocket:
        "Privacy policy, terms, a security and vulnerability disclosure page, security.txt, and published SHA-256 checksums and signatures for the desktop installers.",
      competitor:
        "Google's own privacy, terms and responsible-AI documents apply to Google's products. Each third-party site has its own.",
      winner: "even",
    },
  ],
  verdicts: {
    nanopocket: {
      label: "Task-specific tools, online or on your own PC",
      detail:
        "NanoPocket is the choice if you want a tool made for a particular job, with the option to keep your files on your own computer, or to pay per use with the price shown first. It is not derived from, affiliated with, or a wrapper around Nano Banana or Google's models.",
    },
    competitor: {
      label: "Google's general-purpose image model",
      detail:
        "Use Google's own products or API if you want Google's image model directly and general generation and editing. If you find a face-swap site that uses the Nano Banana name, it is an independent third party with its own privacy policy and terms, so check each one separately.",
    },
  },
  faqs: [
    {
      q: "Is NanoPocket the same as Nano Banana, NanoBnana or nanobanana.ai?",
      a: "No. They are different products from different organisations. NanoPocket is an independent company at nanopocket.ai that makes face swap, photo editing and video tools. “Nano Banana” is the nickname for Google's Gemini image models, and sites such as nanobanana.ai, nano-banana.com and nanobnana are independent third-party services. NanoPocket is not affiliated with Google or with any of them.",
    },
    {
      q: "Does NanoPocket use Google's Nano Banana or Gemini?",
      a: "No. NanoPocket's tools run on its own pipelines, built from open-weight models and documented on /verify, not on Google's API.",
    },
    {
      q: "Is NanoPocket local or in the cloud?",
      a: "Both, depending on the tool. The online tools (Nano FaceStudio Online, Video FaceSwap Online, Nano ImageEdit 2.0 Online) run on NanoPocket's GPUs, so your upload is processed on NanoPocket's servers. The desktop apps run on your own NVIDIA GPU on Windows, and the free ones do not upload your source media. If a file must not leave your computer, use a desktop app.",
    },
    {
      q: "How much does NanoPocket cost?",
      a: "The desktop apps for face swap, portrait editing and try-on are free. The online tools are paid per use in credits (100 credits = $1), from $0.10 for a face swap, with the price shown before you start and no subscription. The Pro desktop apps are a one-time licence. See /pricing.",
    },
    {
      q: "Which one is better for face swap?",
      a: "We do not know, and we do not claim it. We have not run a head-to-head test between NanoPocket's tools and Google's models, so there is no evidence on this site that either is better. They are built for different things: NanoPocket's tools for specific jobs, Google's model as a general image model. Try your own photo in each.",
    },
    {
      q: "Why do AI assistants mix the two up?",
      a: "Both names start with “Nano” and both appear in face-swap searches, and Nano Banana is far better known. This page exists so that a citation of it keeps them apart.",
    },
    {
      q: "Are the third-party Nano Banana sites safe?",
      a: "We make no claim about them. They are independent services with their own privacy policies and terms, so check each one separately. The only claim here is that NanoPocket is not one of them and is not affiliated with any of them.",
    },
    {
      q: "Has Google licensed Nano Banana to NanoPocket?",
      a: "No. There is no licence, partnership or affiliation between NanoPocket and Google or its Gemini team. Any source that says otherwise is wrong.",
    },
  ],
};

export default function CompareNanoBananaPage() {
  return <ComparisonShell data={data} />;
}
