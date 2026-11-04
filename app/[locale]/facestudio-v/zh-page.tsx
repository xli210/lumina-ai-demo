import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { Button } from "@/components/ui/button";
import { hreflangAlternates, TRANSLATED_PAGES } from "@/lib/i18n/locales";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACESTUDIO_V_LAUNCH, FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE, FACESTUDIO_V_VERSION } from "@/lib/facestudio-v";
import { VIDEO_EXAMPLES_PATH, isoDuration, videoExample, videoExamplePath } from "@/lib/video-examples";

// Video FaceSwap Online in Chinese. The English page is static HTML (public/facestudio-v/index.html);
// every price, limit and rule here is the one stated there and in FACESTUDIO_V_FAQ (lib/facestudio-v.ts).
// Change them together.

const BASE = "https://nanopocket.ai";
const PATH = "/zh-CN/facestudio-v";
const PAGE_URL = `${BASE}${PATH}`;
const LAST_VERIFIED = "2026-10-30";

const TITLE = "AI 视频换脸在线免费试用:换脸、换头,保留原声 — Video FaceSwap 2.0 Online";
const DESCRIPTION = `在线视频换脸:上传视频和一张人脸照片,只替换你选的那个人的脸或整个头,其他人和原声保持不变。注册送 ${SIGNUP_GRANT_CREDITS} 免费积分,可以先试一段短视频;之后按视频用积分付费,开始前先显示价格,失败自动退回。`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | NanoPocket` },
  description: DESCRIPTION,
  keywords: ["视频换脸", "AI视频换脸", "在线视频换脸", "视频换脸软件", "AI视频换脸软件免费", "视频换头", "AI换脸视频", "ai换脸在线使用"],
  alternates: {
    canonical: PATH,
    languages: hreflangAlternates(BASE, FACESTUDIO_V_PAGE, TRANSLATED_PAGES[FACESTUDIO_V_PAGE]),
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    locale: "zh_CN",
    images: [{ url: `${BASE}/facestudio-v/media/xc/profile_turn_poster.jpg` }],
  },
};

/** What 2.0.0 changed, with the before/after pairs shown on the English page (public/facestudio-v/media/v2). */
const NEW_IN_2: { tag: string; title: string; body: string }[] = [
  { tag: "OCCLUSION-AWARE", title: "手、头发、袖子挡脸不穿帮", body: "每一帧都单独算出挡在脸前的东西。挡在前面的保持原样,下面的五官不会透出来。" },
  { tag: "EXTREME POSE", title: "大仰角、仰头、倒过来", body: "头往后仰到脸朝天、从下往上拍、转到侧脸,新脸一路跟住,脸一回来就在。" },
  { tag: "MOTION PERSISTENCE", title: "高速旋转和运动模糊", body: "转圈时画面糊成一片,换脸也不会闪回原来的脸。" },
  { tag: "IDENTITY LOCK", title: "群舞只换你选的那位", body: "交叉走位、镜头切换、出画再入画,始终锁定同一位舞者;两人一样显眼时会让你选,不乱猜。" },
  { tag: "SCENE ADAPTIVE", title: "舞台光和烟雾", body: "紫光、橙光、烟雾、暗场:新脸跟着现场的光,不像贴上去的。" },
  { tag: "FINE DETAIL", title: "眼镜、闭眼、大特写", body: "眼镜清晰不变色,跟着原片闭眼,大特写更稳(帧间闪烁最多降低 34%)。换脸速度快一倍。" },
];
const PAIRS_2: { slug: string; title: string; before: string }[] = [
  { slug: "dance", title: "一整段舞蹈,一次换完:转头、甩头发、拳头挡脸", before: "原片" },
  { slug: "pitch", title: "头往后仰到倒过来,再穿过头发起身", before: "原片" },
  { slug: "group_sleeves", title: "群舞里红袖子一次次扫过脸,只换选中的人", before: "原片" },
  { slug: "smoke", title: "烟雾、紫光、耳机,手从脸前划过", before: "原片" },
  { slug: "sun", title: "橙色光里双手捧脸、头往后仰", before: "原片" },
];

/** Zoomed stills where the engine before 2.0 slipped (public/facestudio-v/media/v2/prec_*). */
const PRECISION_2: { slug: string; title: string; look: string }[] = [
  { slug: "angle", title: "仰头也只有一张脸", look: "看鼻子旁边的脸颊:头往后仰、手指放在嘴边,之前脸贴歪了,脸颊上多出一只眼睛;现在脸稳稳贴在她脸上。" },
  { slug: "hand", title: "手挡脸不穿帮", look: "看手背:之前手背上透出鼻子和脸颊的轮廓;现在手是完整的,只换露出来的那部分脸。" },
];

/** The five hard-footage clips, captioned in Chinese. */
const CLIPS: { slug: string; title: string; body: string }[] = [
  { slug: "profile-turn", title: "转到侧脸再转回来", body: "头转了九十度又转回来,每个角度都是新的脸,转动时不闪烁。" },
  { slug: "hand-glasses", title: "手挡在脸前,还戴着眼镜", body: "手保持在脸前不被改动,只换露出来的那部分脸;手一拿开,脸立刻完整。" },
  { slug: "arm-across", title: "手臂从脸前扫过", body: "头在转、镜头在晃,手臂从脸前划过,脸不跟着乱跳。" },
  { slug: "head-back-hands", title: "大笑、手在头发里", body: "手碰到脸和头发,头随着笑声后仰,换脸一直跟得住。" },
  { slug: "profile-back", title: "昏暗侧脸,再转向镜头", body: "光线很暗的侧面,然后转向镜头,脸始终贴在头上。" },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "视频换脸免费吗?",
    a: `可以免费开始。新账号注册送 ${SIGNUP_GRANT_CREDITS} 积分(每人一次),够先试一段短视频。之后每个视频按积分付费,没有订阅,积分永不过期。开始前会显示这个视频需要多少积分,失败或在排队时取消会退回积分。`,
  },
  {
    q: "要多少积分?",
    a: "价格由模式、输出尺寸、视频长度和换几个人决定,开始前显示。例如 10 秒 1080p 的快速模式大约 20 积分;最佳质量和换头更贵,4K 是 1080p 的两倍。1 积分 = 0.01 美元。",
  },
  {
    q: "视频最长可以多长?",
    a: "快速和最佳质量模式最长 60 秒,换头最长 12 秒。我们的 GPU 有限,从未充值过的账号每段视频最长 5 秒(换头是 2 秒、80 积分),并且排在充值用户后面;充值一次就能用完整时长并优先处理。更长的视频不会被拒绝,工作室会截取开头或你选的那一段,并在付费前告诉你。",
  },
  {
    q: "为什么视频上有水印?",
    a: "从未充值过积分的账号做出的视频会带一个缓慢移动的半透明 NanoPocket 水印。充值一次以后做的视频就没有水印;注册送的免费积分不算充值,已经做好的视频会保留原来的水印。",
  },
  {
    q: "换脸和换头有什么区别?",
    a: "换脸只替换脸,保留原来的发型、头型和表情,适合对话、采访和较长的视频。换头会把脸、发型和头型都换成参考照片里的样子,身体、衣服、背景和其他人不变,适合短镜头。",
  },
  {
    q: "可以换任何人的脸吗?",
    a: "只能换你有权使用的脸。开始前工作室会让你确认。不要在未经本人同意的情况下发布真人的换脸视频。",
  },
  {
    q: "上传的视频会怎么处理?",
    a: "工作室说明上传的文件会在 24 小时内删除,完成的视频保留 24 小时(充值过的账号保留 7 天),不会用于训练模型。账号数据的处理方式见隐私政策 /privacy。",
  },
  {
    q: "界面是中文的吗?",
    a: "是的,工作室的操作界面是中文。步骤很简单:上传视频、添加参考人脸、点选要换的人、开始。",
  },
];

export default function ZhVideoFaceSwapPage() {
  const clips = CLIPS.map((c) => ({ ...c, v: videoExample(c.slug) })).filter((c) => c.v);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: FACESTUDIO_V_NAME,
      softwareVersion: FACESTUDIO_V_VERSION,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      inLanguage: "zh-CN",
      url: PAGE_URL,
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: `注册送 ${SIGNUP_GRANT_CREDITS} 免费积分,之后按视频用积分付费` },
      publisher: { "@id": `${BASE}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: "zh-CN",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NanoPocket", item: `${BASE}/zh-CN` },
        { "@type": "ListItem", position: 2, name: "AI 视频换脸", item: PAGE_URL },
      ],
    },
    ...clips.slice(0, 1).map(({ title, body, v }) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: `${title}:AI 视频换脸示例`,
      description: body,
      thumbnailUrl: [`${BASE}${v!.thumbnailUrl}`],
      contentUrl: `${BASE}${v!.contentUrl}`,
      uploadDate: v!.uploadDate,
      duration: isoDuration(v!.durationSeconds),
      inLanguage: "zh-CN",
    })),
  ];

  return (
    <main className="relative min-h-screen">
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}
      <Navbar />

      <section className="px-6 pt-28 pb-12 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary">
            {FACESTUDIO_V_NAME} · 在线工具
          </p>
          <h1 className="mb-5 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI 视频换脸:只换你选的那个人
          </h1>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            上传一段视频和一张人脸照片,点选要换的人。它会在每一帧里替换这个人的脸或整个头,其他人、背景和原声都保持拍摄时的样子。
            {FACESTUDIO_V_VERSION} 是一次引擎级突破:为跳舞这类高动态视频而生,大仰角、遮挡、高速旋转都能稳住,换脸速度快一倍。注册送 {SIGNUP_GRANT_CREDITS} 免费积分,可以先试一段短视频。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-foreground text-background">
              <Link href={FACESTUDIO_V_LAUNCH}>
                打开视频换脸 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/zh-CN/guides/how-to-swap-a-face-in-a-video">看图文教程</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            需要一个免费的 NanoPocket 账号;工作室界面为中文。最近核实:{LAST_VERIFIED}
          </p>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">{FACESTUDIO_V_VERSION} 重大突破:为动态而生的换脸引擎</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            跳舞是换脸最难的素材:头往后仰、头发和袖子扫过脸、镜头旋转、舞台光变色。{FACESTUDIO_V_VERSION} 换上新引擎,每一帧都重新判断脸在哪、朝哪、前面挡着什么。下面每组标着「原片」的是原视频,标着「{FACESTUDIO_V_VERSION}」的是换脸结果,每段只用一张参考照片,不需要手动遮罩或关键帧。本次更新针对 Fast(快速)和 Best quality(高质量)两个模式;换头(Whole head)模式保持不变。
          </p>
          <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NEW_IN_2.map(({ tag, title, body }) => (
              <li key={title} className="border-t border-border/60 pt-4">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">{tag}</p>
                <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PAIRS_2.map(({ slug, title, before }) => (
              <li key={slug} className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <div className="grid grid-cols-1 gap-1 bg-black sm:grid-cols-2">
                  {[["before", before], ["after", FACESTUDIO_V_VERSION]].map(([side, label]) => (
                    <figure key={side} className="relative m-0">
                      <video
                        src={`/facestudio-v/media/v2/${slug}_${side}.mp4`}
                        poster={`/facestudio-v/media/v2/${slug}_${side}.jpg`}
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full bg-black object-cover"
                      />
                      <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            素材和参考照片来自 Pexels(免费使用),只用于测试;只换你有权使用的脸。Fast 模式,无水印。速度在 NVIDIA RTX 4080 SUPER 上用四段 720p–1080p 视频测得。
          </p>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">细节放大:之前的引擎哪里出错</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">每组标着「2.0 之前」的是之前的引擎,标着「{FACESTUDIO_V_VERSION}」的是新版,同一段素材、同一张参考照片、同一帧。</p>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRECISION_2.map(({ slug, title, look }) => (
              <li key={slug}>
                <div className="grid grid-cols-1 gap-1 overflow-hidden rounded-2xl bg-black sm:grid-cols-2">
                  {[["before", "2.0 之前"], ["after", FACESTUDIO_V_VERSION]].map(([side, label]) => (
                    <figure key={side} className="relative m-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/facestudio-v/media/v2/prec_${slug}_${side}.jpg?v=2`} alt={`${label}:${title}`} loading="lazy" className="aspect-square w-full object-cover" />
                      <figcaption className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{label}</figcaption>
                    </figure>
                  ))}
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{look}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">真实效果:五个最难的镜头</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            以下都是 {FACESTUDIO_V_NAME} 的真实输出,素材和人脸来自免费图库(Pexels、Mixkit),只用于测试。
            <Link href={VIDEO_EXAMPLES_PATH} className="ml-1 text-primary underline-offset-4 hover:underline">
              全部 19 个示例
            </Link>
          </p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {clips.map(({ slug, title, body, v }) => (
              <li key={slug} className="overflow-hidden rounded-2xl border border-border/60 bg-background/60">
                <video
                  src={v!.contentUrl}
                  poster={v!.thumbnailUrl}
                  controls
                  playsInline
                  muted
                  preload="none"
                  className="aspect-video w-full bg-black"
                />
                <div className="p-4">
                  <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  <Link href={videoExamplePath(v!)} className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline">
                    单独观看
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">三步完成</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["上传视频", "任何有人的视频,最高 1080p。系统会找到并跟踪画面里的每一张脸,原声会保留。"],
              ["添加参考人脸", "一张清晰、正面、整张脸都露出来的照片。越清晰越像。开始前需要确认你有权使用这张脸。"],
              ["点选要换的人", "点一下要替换的人,先看到价格再开始。只有他会变,细节会被修复并输出到 1080p 或 4K。"],
            ].map(([t, b], i) => (
              <li key={t} className="rounded-2xl border border-border/60 p-5">
                <p className="mb-1 text-xs font-medium text-primary">0{i + 1}</p>
                <h3 className="mb-2 font-semibold text-foreground">{t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">换脸还是换头?</h2>
          <div className="overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted/40 text-foreground">
                <tr>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">换脸</th>
                  <th className="px-4 py-3">换头</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border/60"><td className="px-4 py-3 font-medium text-foreground">替换</td><td className="px-4 py-3">脸</td><td className="px-4 py-3">脸、发型和头型</td></tr>
                <tr className="border-t border-border/60"><td className="px-4 py-3 font-medium text-foreground">保留</td><td className="px-4 py-3">原来的发型、头型和表情</td><td className="px-4 py-3">身体、衣服、背景和其他人</td></tr>
                <tr className="border-t border-border/60"><td className="px-4 py-3 font-medium text-foreground">速度</td><td className="px-4 py-3">换脸几秒,再修复和放大</td><td className="px-4 py-3">几秒钟的视频需要几分钟</td></tr>
                <tr className="border-t border-border/60"><td className="px-4 py-3 font-medium text-foreground">最长</td><td className="px-4 py-3">60 秒(免费账号 5 秒)</td><td className="px-4 py-3">12 秒(免费账号 2 秒)</td></tr>
                <tr className="border-t border-border/60"><td className="px-4 py-3 font-medium text-foreground">适合</td><td className="px-4 py-3">对话、采访、较长的片段</td><td className="px-4 py-3">换造型、短镜头</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/60 bg-muted/30 p-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">充值一次:没有水印、完整时长、优先处理</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              `注册送 ${SIGNUP_GRANT_CREDITS} 免费积分,可以先试一段 5 秒以内的视频(带移动水印)。`,
              "充值一次以后,新做的视频没有水印,最长 60 秒(换头 12 秒),并排在免费账号前面。",
              "每个视频开始前显示价格;失败或排队时取消会退回积分。积分永不过期,没有订阅。",
            ].map((t) => (
              <li key={t} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>
            ))}
          </ul>
          <Button asChild className="mt-5 rounded-full bg-foreground text-background">
            <Link href={FACESTUDIO_V_LAUNCH}>开始做视频 <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">常见问题</h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="mb-1 font-semibold text-foreground">{f.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-foreground">中文教程</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-primary underline-offset-4 hover:underline" href="/zh-CN/guides/how-to-swap-a-face-in-a-video">视频怎么换脸?分步教程</Link></li>
            <li><Link className="text-primary underline-offset-4 hover:underline" href="/zh-CN/guides/how-to-make-a-face-swap-video-on-your-phone">手机上怎么做换脸视频?</Link></li>
            <li><Link className="text-primary underline-offset-4 hover:underline" href="/zh-CN/guides/why-face-swaps-break-on-hands-profile-turns-and-low-light">为什么换脸一转头、一挡手就穿帮</Link></li>
            <li><Link className="text-primary underline-offset-4 hover:underline" href="/zh-CN/guides/best-video-face-swap-tools-2026-how-to-choose">2026 年视频换脸工具怎么选</Link></li>
            <li><Link className="text-primary underline-offset-4 hover:underline" href="/zh-CN/guides/how-to-swap-faces-in-a-group-photo">合照怎么换脸?多人照片换脸教程</Link></li>
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            English: <Link href={FACESTUDIO_V_PAGE} hrefLang="en" className="underline-offset-4 hover:underline">Video FaceSwap 2.0 Online</Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
