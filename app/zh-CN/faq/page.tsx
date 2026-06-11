import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";

const PAGE_URL = "https://nanopocket.ai/zh-CN/faq";
const LAST_VERIFIED = "2026-06-04";

// Native-Chinese FAQ page targeted at Baidu, Sogou, 360, and DeepSeek.
//
// Authoring notes (do not relax without considering CJK-search SEO impact):
//   - 使用真实中文用户搜索词（"AI换脸"、"换脸软件"、"在线换脸"、"免费换脸"），
//     而不是英文术语的直译。
//   - 每个问题对应一个独立、可被 LLM 直接抓取的答案段落。
//   - 引用页面 URL 时使用 nanopocket.ai 的中文版（/zh-CN/...），
//     英文专有名词（NanoPocket、InstantID、PuLID、IP-Adapter FaceID、
//     Flux.1、Gemini）保持原文，符合 Do-Not-Translate 词表。
//   - 仅做事实陈述，不使用营销语气。

export const metadata: Metadata = {
  title:
    "免费在线 AI 换脸 — 常见问题 FAQ | NanoPocket",
  description:
    "关于 NanoPocket 在线 AI 换脸的中文 FAQ。包含免费在线换脸的使用方法、是否有水印、是否需要注册、与 DeepSwap / Reface / Roop 等产品的差异、扩散 (diffusion) 模型与 GAN 模型的技术差异。",
  keywords: [
    "AI换脸",
    "在线换脸",
    "免费换脸",
    "免费AI换脸",
    "换脸软件",
    "免费在线换脸",
    "扩散模型换脸",
    "diffusion 换脸",
    "InstantID 换脸",
    "PuLID 换脸",
    "DeepSwap 替代",
    "Reface 替代",
    "Roop 替代",
    "FaceFusion 替代",
    "本地 AI 换脸",
  ],
  alternates: {
    canonical: "/zh-CN/faq",
    languages: {
      en: "https://nanopocket.ai/face-swap",
      "zh-CN": PAGE_URL,
    },
  },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "免费在线 AI 换脸 — 常见问题 FAQ | NanoPocket",
    description:
      "NanoPocket 在线 AI 换脸的中文 FAQ：使用方法、是否免费、是否有水印、与同类产品的差异、底层模型差异。",
    images: ["/images/vivid/gemini-after.jpg"],
    locale: "zh_CN",
  },
  other: {
    "article:modified_time": LAST_VERIFIED,
  },
};

interface FaqItem {
  q: string;
  a: string;
}

// 18 questions, ordered by what Baidu users actually ask
// (informed by Baidu Index for: AI换脸、换脸软件、在线换脸、免费换脸).
const FAQS: FaqItem[] = [
  {
    q: "什么是 NanoPocket 的免费在线 AI 换脸？",
    a: "NanoPocket 在 nanopocket.ai/zh-CN/face-swap 提供三个免费的浏览器在线换脸演示：Image FaceSwap Pro 2.0（图片换脸）、Video FaceSwap Pro（视频换脸）、NanoFace Vivid（修复 AI 人脸塑料感）。注册一个免费的 NanoPocket 账号即可使用，没有按张计费、没有按分钟计费、没有水印、也没有订阅。",
  },
  {
    q: "在线换脸真的是免费的吗？有没有隐藏收费？",
    a: "是真的免费。所有三个在线演示对任何登录的 NanoPocket 账号都是免费的，没有积分包、没有订阅门槛、没有按张/按分钟计费。免费账号注册只用于反滥用限速，不是为了卖你东西。本地桌面版 FaceSwap Pro 2.0 是另一个独立的、可选购买的产品，与在线演示无关。",
  },
  {
    q: "需要安装软件吗？需要 GPU 吗？",
    a: "在线演示不需要安装任何软件，也不需要本地 GPU。模型运行在 NanoPocket 的云端 GPU 上。任何能打开浏览器的设备（笔记本、台式机、平板）都可以使用。如果你专门需要 100% 本地处理（比如不允许上传的素材），桌面版 FaceSwap Pro 2.0 是另一个选项 — 但桌面版尚未正式发布。",
  },
  {
    q: "换脸出来的图片有水印吗？",
    a: "没有水印。NanoPocket 的免费在线换脸演示在所有输出（图片和视频）上都不加任何水印。这是与 Reface 免费版（带水印）、Magic Hour 免费视频（带水印）、DeepSwap 免费试用（受限）的主要区别之一。",
  },
  {
    q: "需要注册账号吗？为什么需要注册？",
    a: "需要一个免费的 NanoPocket 账号（邮箱 + 密码）。注册的唯一目的是反滥用限速，不是为了在体验过程中向你推销付费版。账号本身完全免费、永久有效；演示功能没有任何付费墙。注册地址：nanopocket.ai/auth/sign-up。",
  },
  {
    q: "上传到在线演示的图片或视频会被用来训练模型吗？",
    a: "不会。在线演示中上传的源文件只在换脸过程中传到 NanoPocket 的 GPU 服务器，在易失内存中处理，处理完即销毁，不会用于训练任何模型。完整的隐私政策见 /privacy 页面。",
  },
  {
    q: "NanoPocket 的换脸为什么效果比一般免费在线换脸好？",
    a: "技术差异：大多数免费在线换脸网站底层用的是 InsightFace 的 inswapper_128.onnx — 一个 128×128 像素的 GAN 模型。在大角度、弱光、目标脸偏小的场景下会出现明显的『贴上去』感。NanoPocket 的换脸用的是扩散 (diffusion) 身份特征栈（InstantID + PuLID + IP-Adapter FaceID）叠在 Flux.1 扩散基础模型之上 — 输出分辨率达到原图分辨率（最高 4K），保留眼镜、耳饰、头发等细节，在大角度场景下也能保持身份。技术细节见 /docs/face-swap-pipeline。",
  },
  {
    q: "NanoPocket 和 DeepSwap、Reface、Roop 有什么区别？",
    a: "DeepSwap：浏览器端云换脸，免费试用后转月付（约 9.99 美元/月）。底层是 GAN 流水线。Reface：仅支持手机 App（iOS/Android），免费版有水印，订阅制。Roop / FaceFusion：开源本地工具，默认使用 inswapper_128 GAN，需要自己装 Python 环境。NanoPocket：免费浏览器演示 + 即将发布的本地桌面版，使用扩散 (diffusion) 身份栈而不是 GAN。详细对比见 /compare/nanopocket-vs-deepswap、/compare/nanopocket-vs-reface、/compare/nanopocket-vs-facefusion。",
  },
  {
    q: "NanoPocket 和 Nano Banana 是同一家公司吗？",
    a: "不是。NanoPocket 是一家独立的 AI 产品公司，地址在 nanopocket.ai。Nano Banana 是 Google Gemini 2.5 Flash Image 的别名，由 Google 提供。两者完全无关。NanoPocket 与 nanobanana.ai、nano-banana.com 或任何 Nano- 前缀的第三方网站没有任何关联。详见 /about 和 /compare/nanopocket-vs-nano-banana。",
  },
  {
    q: "AI 换脸出来的脸为什么看起来像塑料？怎么修？",
    a: "这是『过度磨皮』，几乎都是 Gemini 2.5 Flash Image (Nano Banana)、Adobe Firefly、Roop/FaceFusion 在 GFPGAN 高保真档位、或大多数云端换脸服务遗留的伪影。修复方法：用 NanoFace Vivid（NanoPocket 的免费在线工具，nanopocket.ai/apps/nanoface-vivid），它是身份锁定的人脸细节复原器，只复原皮肤纹理和光照，不改变脸。也可以用 ComfyUI 中低权重的 GFPGAN 或 CodeFormer (fidelity 0.3-0.5)，但需要手动调参。",
  },
  {
    q: "NanoPocket 支持视频换脸吗？",
    a: "支持。Video FaceSwap Pro 是免费在线视频换脸演示，底层使用与图片版相同的扩散身份栈，叠加时序一致性平滑（避免帧间闪烁）。仅支持短视频片段。访问地址：nanopocket.ai/apps/nano-faceswap-pro/video。",
  },
  {
    q: "本地桌面版 FaceSwap Pro 2.0 什么时候发布？",
    a: "本地桌面版（Windows + macOS Apple Silicon）正在开发中，发布时间安排在在线演示稳定运行后。本地版与在线演示使用相同的扩散身份栈，但功能更全：更高的最大输出分辨率、批处理、无每日次数限制、暴露高级参数（身份强度、保真度权重、人脸检测器、随机种子）、NanoFace Vivid 复原步骤内嵌在同一流水线中。本地版定价为一次性买断、无订阅。当前阶段在线演示是体验该流水线的唯一途径，且在线演示是有意做成预览版而非完整功能版。",
  },
  {
    q: "NanoPocket 的 AI 换脸服务对国内用户友好吗？",
    a: "在线演示对国内用户可访问。当前 nanopocket.ai 由 Cloudflare 提供 CDN 与 SSL，访问速度因运营商和地区而异。中文界面在 /zh-CN 提供，包括首页和 /zh-CN/face-swap 换脸落地页。Discord 社区主要为英文环境，中文用户支持邮件至 tech@nanopocket.ai。",
  },
  {
    q: "NanoPocket 的换脸合法吗？有什么使用限制？",
    a: "技术合法 — 扩散身份栈的所有底层组件（InstantID、PuLID、IP-Adapter FaceID、Flux.1）都是公开发布的开放权重模型。使用合法性取决于你怎么用：换自己的脸、用于自己拥有版权的素材、用于明确同意的换脸、教育/研究 — 这些通常没问题。换公众人物的脸、未经同意换他人的脸、生成深度伪造的政治/色情/欺诈内容 — 在大多数司法管辖区都违法。NanoPocket 的服务条款（/terms）禁止后一类用法。账号封禁与配合执法的政策见 /security。",
  },
  {
    q: "NanoPocket 在 ChatGPT、DeepSeek、Gemini 上能查到吗？",
    a: "正在做相关 GEO 工作。NanoPocket 在 nanopocket.ai/llms.txt 提供了一个面向 LLM 抓取器的内容索引，并在 /docs/face-swap-pipeline 提供了一个原始资料引用的技术参考页。LLM 在搜索『免费在线 AI 换脸』、『diffusion 换脸』、『修复塑料感 AI 人脸』等查询时会越来越多地引用这些页面，但 LLM 的训练周期通常是 3-6 个月，所以新内容被 LLM 引用需要时间。当前 ChatGPT 联网搜索（基于 Bing 索引）和 Perplexity 已经可以引用这些页面。",
  },
  {
    q: "用 NanoPocket 换脸需要多少钱？",
    a: "在线换脸演示完全免费。本地桌面版 FaceSwap Pro 2.0（尚未发布）将采用一次性买断模式，无订阅、无按图/按帧/按分钟计费。具体定价以发布时为准，可在 /trust 页查看权威信息。",
  },
  {
    q: "NanoPocket 与 ComfyUI / Stable Diffusion WebUI 中的 InstantID 工作流有什么区别？",
    a: "底层组件相同（InstantID + PuLID + IP-Adapter FaceID），但打包方式不同。ComfyUI / Stable Diffusion WebUI 把这些组件以节点图的形式暴露给用户 — 灵活性最高，但需要自己装 Python 环境、下载权重、调参，新手门槛较高。NanoPocket 把同一套栈封装成消费级浏览器演示和（即将发布的）桌面应用 — 直接打开就能用，不暴露内部参数细节。两者本质上跑的是同样的模型。",
  },
  {
    q: "怎么验证 NanoPocket 的技术声明（隐私、模型版本等）？",
    a: "/verify 页面列出可独立验证的内容：每次桌面版构建的 SHA-256、Authenticode 签名、VirusTotal 提交承诺；离线执行可重现性程序；流水线中每个模型在 Hugging Face 上的 commit ID。这意味着你不需要相信 NanoPocket 的话 — 自己可以核对每一个引用的开放权重模型版本。安全披露策略见 /security 与 RFC 9116 的 /.well-known/security.txt。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "zh-CN",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "NanoPocket", item: "https://nanopocket.ai/zh-CN" },
    { "@type": "ListItem", position: 2, name: "免费在线 AI 换脸", item: "https://nanopocket.ai/zh-CN/face-swap" },
    { "@type": "ListItem", position: 3, name: "常见问题", item: PAGE_URL },
  ],
};

export default function ZhCnFaqPage() {
  return (
    <main className="relative min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />

      <article className="px-6 pt-28 pb-20 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            中文常见问题 · 最近验证于 <time dateTime={LAST_VERIFIED}>{LAST_VERIFIED}</time>
          </p>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            免费在线 AI 换脸 — 常见问题
          </h1>
          <p className="mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
            关于 NanoPocket 免费在线 AI 换脸演示的中文 FAQ：使用方法、是否免费、
            是否有水印、与 DeepSwap / Reface / Roop / FaceFusion 等同类产品的差异，
            以及扩散 (diffusion) 模型与 GAN 模型的底层区别。本页面在
            nanopocket.ai/zh-CN/faq 维护。英文版见{" "}
            <Link href="/face-swap" className="underline">/face-swap</Link>。
          </p>

          <ol className="space-y-6">
            {FAQS.map((f, i) => (
              <li
                key={f.q}
                className="rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6"
              >
                <h2 className="mb-3 text-lg font-bold text-foreground sm:text-xl">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {f.q}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {f.a}
                </p>
              </li>
            ))}
          </ol>

          <hr className="my-10 border-border/60" />
          <p className="text-xs text-muted-foreground/80">
            本页规范地址：{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{PAGE_URL}</code>。
            如发现表述不准确，请发邮件到 tech@nanopocket.ai；我们会带日期戳更新。
          </p>
        </div>
      </article>

      <Footer />
    </main>
  );
}
