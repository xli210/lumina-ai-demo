import type { Metadata } from "next";
import {
  ProductLandingShell,
  type ProductLandingData,
} from "@/app/components/product-landing-shell";

export const metadata: Metadata = {
  title:
    "Nano ImageTryon — Local AI Virtual Try-On with Body & Pose Preservation",
  description:
    "Nano ImageTryon is a local desktop virtual try-on app. It transfers any garment from a reference photo onto a target subject while preserving body shape, pose, and lighting — running entirely on the user's NVIDIA GPU with no cloud upload of personal photos.",
  keywords: [
    "Nano ImageTryon",
    "AI virtual try-on",
    "local virtual try-on",
    "AI clothing swap",
    "garment transfer AI",
    "Doji alternative",
    "Outfit Anyone alternative",
    "Kolors Virtual Try-On alternative",
    "Fashn AI alternative",
    "virtual fitting room AI",
    "fashion AI try-on local",
    "body shape preservation try-on",
    "private virtual try-on",
  ],
  alternates: { canonical: "/apps/nano-imagetryon" },
  openGraph: {
    title: "Nano ImageTryon — Local AI Virtual Try-On",
    description:
      "Garment transfer from any reference photo with body and pose preservation. Local NVIDIA GPU, no cloud upload.",
    type: "website",
    url: "https://nanopocket.ai/apps/nano-imagetryon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nano ImageTryon — Local AI Virtual Try-On",
    description:
      "Local virtual try-on with body and pose preservation. NVIDIA GPU, no cloud upload.",
  },
};

const data: ProductLandingData = {
  slug: "nano-imagetryon",
  productMeta: {
    sku: "NPK-ITN-100",
    mpn: "NPK-ITN-100",
    brand: "NanoPocket",
    url: "https://nanopocket.ai/apps/nano-imagetryon",
    image: "https://nanopocket.ai/og-image.jpg",
    category: "Local AI Virtual Try-On",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows 10/11 (NVIDIA CUDA)",
    softwareVersion: "1.0.0",
    releaseDate: "2026-04-30",
    description:
      "Nano ImageTryon — local AI virtual try-on for Windows 10/11. Transfers any garment from a reference photo (catalog shot, flat-lay, street photo) onto a target subject while preserving body shape, pose, and scene lighting. Runs on a single NVIDIA GPU. No personal photo uploaded. A local alternative to VITON-HD, Doji, OutfitAnyone, IDM-VTON, and CatVTON cloud demos.",
    offer: {
      price: "0.00",
      priceCurrency: "USD",
      availability: "InStock",
      priceValidUntil: "2027-12-31",
    },
    additionalProperties: [
      { name: "Reference inputs", value: "Catalog shot, flat-lay, street-fashion photo, screenshot" },
      { name: "Preserved attributes", value: "Body shape, pose, scene lighting, skin tone" },
      { name: "Garment transfer model", value: "Diffusion-based, reference-conditioned" },
      { name: "Output", value: "Photo-realistic; no 3D garment asset required" },
      { name: "GPU runtime", value: "Single NVIDIA GPU (CUDA), Windows 10/11" },
      { name: "Data handling", value: "100% local; personal photos never uploaded" },
      { name: "Network requirement", value: "Only for license activation" },
      { name: "License model", value: "One-time, machine-bound; no per-photo fees" },
    ],
  },
  documentation: {
    lastVerified: "2026-05-29",
    methodology:
      "Garment-transfer fidelity is reported as VITON-HD-style FID + LPIPS on the in-house Tryon-Eval-120 set (120 paired subject + reference garment photos, balanced for body type, pose, and garment category). Per-photo wall-clock measured on RTX 4070 (12 GB VRAM, fp16) and RTX 4090 (24 GB VRAM, fp16) at 1024 × 1024 output, batch=1.",
    scope: {
      bestFor: [
        "E-commerce: trying multiple SKUs on one model photo",
        "Influencer / creator content swapping outfits between shoots",
        "Stylists prototyping looks before a physical fitting",
        "Brands localising catalog imagery without re-shoots",
        "Replacing Doji / Outfit Anyone / Fashn AI cloud subscriptions",
      ],
      notRecommendedFor: [
        "Garments with complex 3D structure (corsets, hoop skirts)",
        "Footwear (current model is upper- and full-body only)",
        "Print-quality e-commerce on > 4K subject photos",
        "Apple Silicon Macs (Windows + NVIDIA only in v1.0.0)",
        "Any non-consensual likeness use — explicitly prohibited",
      ],
    },
    limitations: [
      {
        title: "Footwear is out of scope",
        detail:
          "v1.0.0 covers tops, dresses, jackets, and full-body looks. Shoes and footwear are not currently supported and may inherit the subject's original footwear.",
      },
      {
        title: "Complex 3D garment structure",
        detail:
          "Highly structured garments — corsets, hoop skirts, formal wear with internal boning — can lose fit detail because the diffusion prior does not have a 3D garment representation. Use a closer-fitting reference garment if possible.",
      },
      {
        title: "Pose / body-type extreme mismatch",
        detail:
          "Transferring a garment fitted on a 6-foot reference model onto a very different body type (e.g. seated subject) preserves proportions but can soften the garment's silhouette. Source a reference closer to the target pose.",
      },
      {
        title: "Pattern drift across the body",
        detail:
          "Repeating prints (large checks, stripes) can shift slightly across the torso. Acceptable for marketing creative; not yet print-quality for textile reproduction.",
      },
      {
        title: "Apple Silicon not supported",
        detail:
          "v1.0.0 is Windows + NVIDIA CUDA only. Metal port is on the roadmap.",
      },
      {
        title: "Subject must be visible head-to-mid-thigh minimum",
        detail:
          "Detailed try-on requires the subject's torso and hips to be visible. Headshots or extreme close-ups are not supported.",
      },
    ],
    evidence: [
      {
        label:
          "Choi et al. — VITON-HD: High-Resolution Virtual Try-On via Misalignment-Aware Normalization (arXiv:2103.16874, 2021)",
        url: "https://arxiv.org/abs/2103.16874",
        note: "Foundational HD virtual try-on benchmark referenced for FID / LPIPS protocol.",
      },
      {
        label:
          "Choi et al. — IDM-VTON: Improving Diffusion Models for Authentic Virtual Try-on in the Wild (arXiv:2403.05139, 2024)",
        url: "https://arxiv.org/abs/2403.05139",
        note: "Diffusion-based try-on architecture referenced for our reference-conditioning module.",
      },
      {
        label:
          "Sun et al. — OutfitAnyone: Ultra-high quality virtual try-on for any clothing and any person (arXiv:2407.16224, 2024)",
        url: "https://arxiv.org/abs/2407.16224",
        note: "Closely related cloud system — referenced for direct comparison.",
      },
      {
        label: "DressCode dataset",
        url: "https://github.com/aimagelab/dress-code",
        note: "Public garment / pose dataset used during QA.",
      },
    ],
  },
  hero: {
    eyebrow: "AI Virtual Try-On",
    versionChip: "v1.0.0",
    title: "Nano",
    titleAccent: "ImageTryon",
    lead: "Nano ImageTryon is a local desktop virtual try-on application that transfers any garment from a reference photo onto a target subject on a single NVIDIA GPU on Windows, preserving body shape, pose, and scene lighting without uploading any personal photo to the cloud.",
    parameters: [
      {
        value: "Any reference",
        label: "Garment transfer from any photo",
      },
      {
        value: "Body & pose",
        label: "Preserved across the transfer",
      },
      { value: "Local-only", label: "No upload of personal photos" },
    ],
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-imagetryon",
      variant: "secondary",
    },
  },
  trust: [
    { label: "Body and pose preservation" },
    { label: "Local-only · GDPR-friendly" },
    { label: "Single-GPU NVIDIA CUDA" },
    { label: "Photo-realistic garment fit" },
  ],
  sections: [
    {
      index: "01",
      eyebrow: "Garment transfer",
      title: "Any garment, from any reference photo.",
      lead: "Nano ImageTryon accepts a target subject photo and a reference garment photo (catalog shot, e-commerce flat-lay, or street-fashion image) and transfers the garment onto the subject — fabric texture, color, and silhouette retained — without requiring a 3D garment asset or a fitting-room rig.",
      bullets: [
        "Reference can be a catalog shot, flat-lay, or street photo",
        "Fabric texture, color, and silhouette retained",
        "No 3D garment asset required",
        "No fitting-room rig required",
      ],
      hint: "Photo in · garment out",
    },
    {
      index: "02",
      eyebrow: "Body preservation",
      title: "Subject's proportions stay intact.",
      lead: "The transfer model is constrained to keep the target subject's body proportions, height, and pose stable, so a garment that fits a 6-foot model in the reference photo lands on the target subject at the target subject's proportions, not the reference model's.",
      bullets: [
        "Subject body proportions preserved",
        "Pose and limb positions kept stable",
        "Height and shoulder line retained",
        "No identity drift on the subject's face",
      ],
      hint: "Subject's body · reference's garment",
    },
    {
      index: "03",
      eyebrow: "Lighting consistency",
      title: "Garment lit by the target scene.",
      lead: "The transferred garment is relighted under the target subject's scene lighting — direct sun, overcast, indoor, or studio — so a garment from a sunlit reference does not look out-of-place on a target subject shot indoors.",
      bullets: [
        "Garment relit under the target scene",
        "Direct sun, overcast, indoor, studio handled",
        "No flat-cutout look on the result",
        "Specular highlights respect the subject's photo",
      ],
      hint: "Re-lit garment · scene-aware",
    },
    {
      index: "04",
      eyebrow: "Use cases",
      title: "Catalog, marketplace, and personal styling.",
      lead: "Nano ImageTryon is targeted at three workflows: e-commerce catalog re-photography, marketplace listing variants (one model, many garments), and personal styling — all running locally so subject photos and reference inventory never reach a third-party server.",
      bullets: [
        "E-commerce catalog re-photography",
        "Marketplace listing variants (one model, many garments)",
        "Personal styling and outfit preview",
        "All workflows local — no third-party server",
      ],
      hint: "Catalog · marketplace · personal",
    },
    {
      index: "05",
      eyebrow: "Privacy",
      title: "Personal photos never leave the disk.",
      lead: "Subject photos and reference garment photos are not uploaded to any server. Every model runs on the user's GPU; the only network handshake is product-bound license activation, and the application performs no content-level telemetry.",
      bullets: [
        "Subject photos never uploaded",
        "Reference garments never uploaded",
        "No content-level telemetry",
        "Network used only for license activation",
      ],
      hint: "Local-only · activation only",
    },
    {
      index: "06",
      eyebrow: "How it compares",
      title: "Doji-quality try-on, locally.",
      lead: "Doji, Outfit Anyone, Kolors Virtual Try-On, and Fashn AI run server-side and require subject and garment photos to be uploaded. Nano ImageTryon runs locally on a single NVIDIA GPU with a one-time license, preserves subject body and pose, and handles scene-lighting transfer in the same single-pass run.",
      bullets: [
        "Local processing on a single license",
        "Subject body and pose preserved",
        "Single-pass garment transfer + relight",
        "Subject and garment photos stay local",
      ],
      hint: "vs Doji · vs Outfit Anyone · vs Fashn AI",
    },
  ],
  faqs: [
    {
      q: "Can I try on clothes from any catalog photo?",
      a: "Yes. The reference can be a catalog shot, an e-commerce flat-lay, a street-fashion image, or a screenshot. No 3D garment asset and no fitting-room rig are required — two photos is all the pipeline needs.",
    },
    {
      q: "Will the garment actually fit my body shape?",
      a: "Yes. The transfer model is constrained to preserve the target subject's body proportions, pose, and height. A garment shot on a 6-foot fit model lands on the target subject at the target subject's own proportions, not the fit model's.",
    },
    {
      q: "Does the lighting look right when the photos were taken in different places?",
      a: "Yes. The transferred garment is relighted under the target subject's scene lighting — direct sun, overcast, indoor, or studio — so a garment from a sunlit reference does not look flat against an indoor target.",
    },
    {
      q: "Do my photos get uploaded?",
      a: "No. Subject and reference photos are not uploaded. Every model runs on the local NVIDIA GPU; the only network handshake is product-bound license activation, and there is no content-level telemetry.",
    },
    {
      q: "How is this different from Doji or Outfit Anyone?",
      a: "Doji, Outfit Anyone, Kolors Virtual Try-On, IDM-VTON, and Fashn AI run server-side and require both subject and garment photos to be uploaded. Nano ImageTryon runs locally on a single NVIDIA GPU on Windows with a one-time license; subject photos and reference garments stay on the user's machine.",
    },
    {
      q: "Can I use it for my online shop?",
      a: "Yes. The license is one-time and machine-bound, with no per-photo fees. Generated try-on images can be used in commercial deliverables — e-commerce listings, lookbooks, marketing — under the standard Terms of Use. The user retains full output rights.",
    },
    {
      q: "What hardware do I need?",
      a: "Windows 10 or 11 with an NVIDIA GPU. RTX 30, 40, and 50-series cards are tested; 8 GB of VRAM is the recommended minimum. More VRAM lets you process higher-resolution subject photos.",
    },
  ],
  closing: {
    title: "Install Nano ImageTryon.",
    body: "Local virtual try-on with garment transfer, body and pose preservation, and scene-lighting transfer in one pass. NVIDIA GPU, one-time license, photos stay on disk.",
    primaryCta: { label: "Download for Windows", href: "/download" },
    secondaryCta: {
      label: "Read the release notes",
      href: "/release-notes/nano-imagetryon",
      variant: "secondary",
    },
  },
};

export default function NanoImageTryonPage() {
  return <ProductLandingShell data={data} />;
}
