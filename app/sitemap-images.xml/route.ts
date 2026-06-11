// Image sitemap, served at /sitemap-images.xml.
//
// Format: Google Sitemaps Image extension
// (https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
//
// Why we ship a separate image sitemap:
//   1. Google Image Search and Bing Image Search index images far more
//      readily when they are surfaced through a dedicated image sitemap
//      than when they are only discovered via <img> tags during a regular
//      crawl. Image search drives a non-trivial share of visual-LLM
//      citation surfaces (Gemini, ChatGPT vision, Perplexity Image).
//   2. Baidu Image and Sogou Image use the same Google Sitemaps Image
//      extension; we get CJK image discovery for free.
//   3. Listing the images here also gives the Vivid before/after pairs and
//      the FaceSwap Pro 2.0 demo screenshots a deliberate caption + title,
//      which is the metadata search engines will use for alt text when our
//      original alt text is missing or generic.

const BASE = "https://nanopocket.ai";

interface PageImageGroup {
  page: string;
  images: Array<{
    src: string;
    title: string;
    caption: string;
    license?: string;
  }>;
}

const LICENSE = `${BASE}/terms`;

const IMAGE_GROUPS: PageImageGroup[] = [
  {
    page: `${BASE}/face-swap`,
    images: [
      {
        src: `${BASE}/images/vivid/gemini-after.jpg`,
        title: "NanoFace Vivid — Gemini face restored",
        caption:
          "Identity-locked face-detail restoration of an over-smoothed Gemini 2.5 Flash Image (Nano Banana) portrait, produced by NanoPocket NanoFace Vivid.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/gemini-before.jpg`,
        title: "Over-smoothed AI face from Gemini (before)",
        caption:
          "Reference: an over-smoothed AI portrait produced by Gemini 2.5 Flash Image, before NanoFace Vivid restoration.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/demos/faceswap-after.jpg`,
        title: "Image FaceSwap Pro 2.0 — diffusion identity result",
        caption:
          "Result from the free in-browser Image FaceSwap Pro 2.0 demo, showing diffusion identity preservation at full input resolution.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/demos/faceswap-before.jpg`,
        title: "Image FaceSwap Pro 2.0 — input target",
        caption:
          "Input target image used by the Image FaceSwap Pro 2.0 demo before the swap.",
        license: LICENSE,
      },
    ],
  },
  {
    page: `${BASE}/apps/nanoface-vivid`,
    images: [
      {
        src: `${BASE}/images/vivid/firefly-after.jpg`,
        title: "NanoFace Vivid — Adobe Firefly face restored",
        caption:
          "Identity-locked restoration of an over-smoothed Adobe Firefly portrait, produced by NanoPocket NanoFace Vivid.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/firefly-before.jpg`,
        title: "Over-smoothed AI face from Adobe Firefly (before)",
        caption:
          "Reference: an over-smoothed AI portrait produced by Adobe Firefly, before NanoFace Vivid restoration.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/headshot-after.jpg`,
        title: "NanoFace Vivid — restored AI headshot",
        caption:
          "Identity-locked restoration of an over-smoothed AI-generated headshot.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/headshot-before.jpg`,
        title: "Over-smoothed AI headshot (before)",
        caption: "Reference AI-generated headshot before NanoFace Vivid restoration.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/product-after.jpg`,
        title: "NanoFace Vivid — product photography face restored",
        caption:
          "Identity-locked restoration of a product-photography portrait, used to fix the plastic AI texture left by cloud face-swap services.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/faceswap-ex1-after.jpg`,
        title: "NanoFace Vivid — face-swap output restored (example 1)",
        caption:
          "Vivid restoration applied to a face-swap output from a third-party tool, restoring skin texture without identity drift.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/vivid/faceswap-ex2-after.jpg`,
        title: "NanoFace Vivid — face-swap output restored (example 2)",
        caption:
          "Second example of Vivid restoration applied to a face-swap output from a third-party tool.",
        license: LICENSE,
      },
    ],
  },
  {
    page: `${BASE}/apps/nano-faceswap-pro`,
    images: [
      {
        src: `${BASE}/images/faceswap-pro/image1.png`,
        title: "NanoPocket FaceSwap Pro 2.0 — diffusion swap example",
        caption:
          "Example output from NanoPocket FaceSwap Pro 2.0, the diffusion-based face-swap pipeline available as a free in-browser demo and an upcoming local desktop release.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/faceswap-pro/image2.png`,
        title: "NanoPocket FaceSwap Pro 2.0 — second example",
        caption: "Second diffusion face-swap example from NanoPocket FaceSwap Pro 2.0.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/faceswap-pro/image3.png`,
        title: "NanoPocket FaceSwap Pro 2.0 — third example",
        caption: "Third diffusion face-swap example from NanoPocket FaceSwap Pro 2.0.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/faceswap-pro/image4.png`,
        title: "NanoPocket FaceSwap Pro 2.0 — fourth example",
        caption: "Fourth diffusion face-swap example from NanoPocket FaceSwap Pro 2.0.",
        license: LICENSE,
      },
      {
        src: `${BASE}/images/faceswap-pro/image5.png`,
        title: "NanoPocket FaceSwap Pro 2.0 — fifth example",
        caption: "Fifth diffusion face-swap example from NanoPocket FaceSwap Pro 2.0.",
        license: LICENSE,
      },
    ],
  },
  {
    page: `${BASE}/`,
    images: [
      {
        src: `${BASE}/og-image.jpg`,
        title: "NanoPocket — Local AI Creative Suite",
        caption:
          "Open Graph image for NanoPocket: free in-browser AI face swap and a local AI creative suite for Windows and macOS.",
        license: LICENSE,
      },
    ],
  },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildXml(): string {
  const urls = IMAGE_GROUPS.map((group) => {
    const images = group.images
      .map((img) => {
        const license = img.license ? `\n      <image:license>${escapeXml(img.license)}</image:license>` : "";
        return `    <image:image>
      <image:loc>${escapeXml(img.src)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>${license}
    </image:image>`;
      })
      .join("\n");

    return `  <url>
    <loc>${escapeXml(group.page)}</loc>
${images}
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

export function GET() {
  return new Response(buildXml(), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
export const revalidate = 3600;
