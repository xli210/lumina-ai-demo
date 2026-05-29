import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano FacialEdit — Local AI Portrait Retouch & Identity-Preserving Expression Editor",
  description:
    "Nano FacialEdit is a local desktop portrait editor that performs identity-preserving expression editing — open eyes, soften frowns, lift smiles — and skin retouching on a single NVIDIA GPU. Every operation runs offline; no portrait is uploaded to any server.",
  keywords: [
    "Nano FacialEdit",
    "AI portrait retouch",
    "local portrait editor",
    "expression editor AI",
    "identity preserving expression edit",
    "open eyes AI",
    "smile editor AI",
    "Facetune alternative",
    "AirBrush alternative",
    "Fotor AI alternative",
    "Canva AI alternative",
    "skin retouch AI",
    "portrait enhancement local",
  ],
  alternates: { canonical: "/apps/nano-facialedit" },
  openGraph: {
    title: "Nano FacialEdit — Local AI Portrait Retouch & Expression Editor",
    description:
      "Identity-preserving expression editing and skin retouch on a single NVIDIA GPU. Local-only, no cloud upload.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-facialedit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano FacialEdit — Local AI Portrait Retouch & Expression Editor",
    description:
      "Identity-preserving expression edit and skin retouch on a single NVIDIA GPU. Local-only.",
  },
};

const data: ProductLandingData = {
  slug: "nano-facialedit",
  productMeta: {
    sku: "NPK-FED-102",
    mpn: "NPK-FED-102",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-facialedit",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Local AI Portrait Retouch & Expression Editor",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows 10/11 (NVIDIA CUDA)",
    softwareVersion: "1.0.2",
    releaseDate: "2026-04-02",
    description:
      "Nano FacialEdit — local AI portrait editor for identity-preserving expression editing (open eyes, soften frown, lift smile) and skin retouching. Runs on a single NVIDIA GPU on Windows 10/11. Source portraits never uploaded. A local alternative to Facetune, Adobe Lightroom AI portrait, Topaz Photo AI, Codeformer, and GFPGAN.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Editing axes", value: "Expression, smile, brow position, eye openness, mouth open/close" },
      { name: "Identity preservation", value: "Identity loss preserves face shape, skin tone, distinctive features" },
      { name: "Skin retouching", value: "Pore-preserving, no plastic smoothing" },
      { name: "Control", value: "Per-axis sliders (continuous, deterministic re-render)" },
      { name: "GPU runtime", value: "Single NVIDIA GPU (CUDA), Windows 10/11" },
      { name: "Data handling", value: "100% local; source portraits never uploaded" },
      { name: "Network requirement", value: "Only for license activation" },
      { name: "License model", value: "One-time, machine-bound; no per-portrait fees" },
    ],
  },
  documentation: {
    lastVerified: "2026-05-29",
    methodology:
      "Identity preservation is reported as ArcFace cosine similarity between the original and edited portrait, averaged over the in-house FacialEdit-Eval-150 set (150 portraits, balanced for age, ethnicity, lighting, and expression starting point). Per-portrait wall-clock measured on RTX 4070 (12 GB VRAM, fp16, Windows 11 23H2 driver 553.62), single subject, per-axis edit slider full-range traversal.",
    scope: {
      bestFor: [
        "Editorial / e-commerce portrait retouch on tight deadlines",
        "Headshot subject correction (eyes closed, neutral expression)",
        "Wedding & event photographers needing per-subject retouch",
        "Studios that cannot upload likeness (NDA / contract talent)",
        "Replacing Facetune + Lightroom AI subscription stack",
      ],
      notRecommendedFor: [
        "Generative full-portrait composition (use Nano ImageEdit)",
        "Body / pose editing — restricted to head and face",
        "Ethically sensitive uses (impersonation, deepfake misuse)",
        "Apple Silicon Macs (Windows + NVIDIA only in v1.0.2)",
        "Profile shots beyond ~70° yaw — landmarks unreliable",
      ],
    },
    limitations: [
      {
        title: "Profile / extreme yaw portraits",
        detail:
          "Identity preservation is QA-tested up to ~70° yaw. Beyond that, landmark detection becomes unreliable and the edit may distort facial structure.",
      },
      {
        title: "Group photo per-face throughput",
        detail:
          "Each face in a group portrait is edited as a separate per-subject pass. Throughput scales linearly: a 6-person group is roughly 6× the single-subject latency.",
      },
      {
        title: "Aggressive retouch can over-smooth",
        detail:
          "Per-portrait retouch strength is exposed as a slider. Settings above ~0.7 begin to remove individuality (freckles, fine wrinkles); we recommend ≤0.5 for editorial work.",
      },
      {
        title: "Severe makeup or glasses across the face",
        detail:
          "Heavy theatrical makeup, mirrored sunglasses, or full-face VR headsets can defeat the identity encoder; edit results may revert toward generic prior.",
      },
      {
        title: "Apple Silicon not supported",
        detail:
          "v1.0.2 is Windows + NVIDIA CUDA only. Metal port shares the codebase with Nano ImageEnh Pro 3.0 and is on the roadmap.",
      },
      {
        title: "No body-pose editing",
        detail:
          "Edit axes are deliberately limited to head, face, and expression. Body and pose edits are out of scope to keep the identity-loss objective tractable.",
      },
    ],
    evidence: [
      {
        label:
          "Wang et al. — InstantID: Zero-shot Identity-Preserving Generation in Seconds (arXiv:2401.07519, 2024)",
        url: "https://arxiv.org/abs/2401.07519",
        note: "Identity-loss objective shared with the Nano FaceSwap Pro stack.",
      },
      {
        label:
          "Hyung et al. — DiffSwap: High-Fidelity and Controllable Face Swapping via 3D-Aware Masked Diffusion (arXiv:2308.13495, 2023)",
        url: "https://arxiv.org/abs/2308.13495",
        note: "Diffusion-based facial editing reference architecture.",
      },
      {
        label:
          "Wang et al. — RestoreFormer: High-Quality Blind Face Restoration from Undegraded Key-Value Pairs (arXiv:2201.06374, 2022)",
        url: "https://arxiv.org/abs/2201.06374",
        note: "Restoration head used for skin-detail preservation.",
      },
      {
        label: "Lightricks — Facetune",
        url: "https://www.lightricks.com/products/facetune/",
        note: "Mobile competitor — referenced for direct comparison.",
      },
    ],
  },
  hero: {
    eyebrow: "AI Portrait Retouch",
    versionChip: "v1.0.2",
    title: "Nano",
    titleAccent: "FacialEdit",
    lead: "Nano FacialEdit is a local desktop portrait editor that performs identity-preserving expression edits — open eyes, soften a frown, lift a smile — and skin retouching on a single NVIDIA GPU on Windows, with slider-driven control over each axis and zero portrait uploads.",
    parameters: [
      {
        value: "Identity-preserving",
        label: "Subject likeness retained across edits",
      },
      {
        value: "Slider-driven",
        label: "Expression · smile · brow · eyes",
      },
      { value: "Local-only", label: "Portraits never leave the disk" },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-facialedit",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Identity-preserving edits" },
    { label: "Local-only · GDPR-friendly" },
    { label: "Single-GPU NVIDIA CUDA" },
    { label: "One-time license" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Identity preservation",
      title: "Edit the expression, not the face.",
      lead: "Every Nano FacialEdit edit is constrained by an identity loss against the original portrait, so the subject's likeness — face shape, skin tone, distinctive features — is retained when expression, smile, brow, or eye openness change.",
      bullets: [
        "Identity loss preserved across every edit",
        "Face shape and skin tone kept stable",
        "Distinctive features retained (moles, scars, wrinkles)",
        "Eliminates the subject-drift seen in generic image-to-image edits",
      ],
      hint: "Identity loss · zero subject drift",
    },
    {
      index: "02",
      eyebrow: "Expression sliders",
      title: "Continuous control, no presets.",
      lead: "Expression, smile, brow, and eye openness are exposed as continuous sliders rather than discrete presets, so a portrait can be re-targeted from a closed-eye blink to fully open eyes with a single drag, without re-shooting and without prompt engineering.",
      bullets: [
        "Continuous sliders for expression, smile, brow, eyes",
        "Per-axis control — smile and brow are independent",
        "Closed-eye to open-eye in a single drag",
        "No discrete preset menus",
      ],
      hint: "Slider-driven · per-axis",
    },
    {
      index: "03",
      eyebrow: "Skin retouch",
      title: "Retouch with anatomical respect.",
      lead: "The skin-retouch pipeline removes specific blemishes, redness, and uneven tone while keeping pores, fine lines, and skin texture intact — the failure mode in many beauty apps is an over-smoothed plastic look, which the underlying model is trained against.",
      bullets: [
        "Targeted blemish, redness, and tone correction",
        "Pores and fine lines preserved",
        "No over-smoothed plastic look",
        "Strength slider per portrait",
      ],
      hint: "Pores in · plastic out",
    },
    {
      index: "04",
      eyebrow: "Portrait swap",
      title: "Built-in face swap for portraits.",
      lead: "A face-swap mode is bundled inside the same desktop app for portrait scenarios, sharing the diffusion identity backbone with Nano FaceSwap Pro 2.0 so the same identity quality applies to single-subject portrait work without launching a second tool.",
      bullets: [
        "Single-subject portrait face swap inside the app",
        "Shared identity backbone with Nano FaceSwap Pro 2.0",
        "No separate install required",
        "Same accessory-preservation behavior",
      ],
      hint: "Same backbone · single subject",
    },
    {
      index: "05",
      eyebrow: "Privacy",
      title: "Portraits never leave the machine.",
      lead: "Source portraits are never uploaded; every model — expression, smile, brow, eye openness, retouch, swap — runs on the local NVIDIA GPU. The only network handshake is product-bound license activation.",
      bullets: [
        "All inference local on the user's GPU",
        "Source portraits never uploaded",
        "No content-level telemetry",
        "Network used only for license activation",
      ],
      hint: "Local-only · activation only",
    },
    {
      index: "06",
      eyebrow: "How it compares",
      title: "Facetune-class control, locally.",
      lead: "Facetune, AirBrush, and Fotor AI run on phones with cloud-assisted models and a per-feature paywall. Nano FacialEdit runs on a desktop GPU, exposes continuous sliders for expression and smile, and bundles skin retouch and portrait face swap in a single one-time license.",
      bullets: [
        "Continuous sliders for expression and smile",
        "Skin retouch and face swap in one app",
        "One-time license, no per-feature paywall",
        "Local NVIDIA GPU inference",
      ],
      hint: "vs Facetune · vs AirBrush",
    },
  ],
  faqs: [
    {
      q: "Can I open someone's closed eyes in a group photo?",
      a: "Yes. The eye-openness slider is a continuous control that can lift partially-closed or fully-closed eyes on a per-subject basis, while the identity loss keeps the rest of the face stable. There is no prompt to write — drag the slider.",
    },
    {
      q: "Will it make the skin look plastic / over-smoothed?",
      a: "No. The retouch pipeline removes targeted blemishes, redness, and uneven tone while preserving pores, fine lines, and skin texture. Per-portrait strength lets you tune lightly for editorial work or harder for passport-style retouches.",
    },
    {
      q: "Will the subject still look like themselves?",
      a: "Yes. Every edit is constrained by an identity loss against the original portrait, so face shape, skin tone, and distinctive features (moles, scars, wrinkles) stay stable when expression, smile, brow, or eyes change. There's no subject-drift typical of generic image-to-image edits.",
    },
    {
      q: "How is this different from Facetune or Adobe Lightroom AI portrait?",
      a: "Facetune runs on phones with cloud-assisted models and a per-feature paywall. Lightroom's portrait AI is a subscription bolt-on. Nano FacialEdit runs on a desktop NVIDIA GPU, exposes continuous sliders for expression and smile, bundles retouch and portrait face swap in one app, and ships a one-time license with no per-feature charges.",
    },
    {
      q: "Do my portraits get uploaded?",
      a: "No. Every operation runs on the local GPU. Source portraits are not uploaded, not retained server-side, and not used for model training. The only network traffic is a one-time license-activation handshake.",
    },
    {
      q: "Can I use it for client retouching?",
      a: "Yes. The license is one-time and machine-bound, with no per-portrait fees. Retouched and expression-edited portraits can be used in commercial deliverables — editorial, e-commerce, marketing — under the standard Terms of Use. The user retains full output rights.",
    },
    {
      q: "Does it work on group photos?",
      a: "Yes. Per-subject regions can be edited independently — e.g. open eyes on one face while leaving others untouched — and the identity loss is computed per subject so each face keeps its own likeness.",
    },
  ],
  closing: {
    title: "Install Nano FacialEdit.",
    body: "Identity-preserving expression edits, slider-driven control over smile, brow, and eyes, and a portrait-grade face swap in the same app. Local NVIDIA GPU, one-time license.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-facialedit",
      variant: "secondary",
    },
  },
};

export default function NanoFacialEditPage() {
  return <ProductLandingShell data={data} />;
}
