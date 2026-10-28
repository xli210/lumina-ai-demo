import { HEADSWAP_PRO_CREDITS_PER_IMAGE as CREDITS, HEADSWAP_PRO_MAX_VARIATIONS as MAX, HEADSWAP_PRO_NAME as NAME } from "@/lib/headswap-pro";

/**
 * Every word on the HeadSwap Pro launch page, in each language it is published in. The page layout lives once,
 * in launch-page.tsx; English is at /headswap-pro and the others at /<locale>/headswap-pro.
 *
 * Product names (Nano HeadSwap Pro, Nano FaceStudio Online, NanoPocket) are never translated. Prices and limits
 * come from lib/headswap-pro.ts, so a change there reaches every language. The tool itself
 * (/headswap-pro/index.html) is English only, which the translated pages say.
 */

export type HsLocale = "en" | "zh-CN" | "ja";
export const HS_LOCALES: readonly HsLocale[] = ["en", "zh-CN", "ja"];
export const HS_TRANSLATED: readonly HsLocale[] = ["zh-CN", "ja"];

const USD = `$${(CREDITS / 100).toFixed(2)}`;

/** Strings the before/after slider shows. "{title}" is replaced with the example's title. */
export interface CompareLabels {
  vsEarlier: string;
  vsOriginal: string;
  originalVsPro: string;
  groupLabel: string;
  newHead: string;
  newHeadAlt: string;
  earlierTag: string;
  originalTag: string;
  resultAlt: string;
  earlierAlt: string;
  originalAlt: string;
  sliderEarlier: string;
  sliderOriginal: string;
}

type Example = { title: string; note: string };

export interface HsCopy {
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  kicker: string;
  heroLine: string;
  ctaOpen: string;
  ctaSoon: string;
  watchFilm: string;
  heroNote: string;
  teaserAlt: string;
  statementA: string;
  statementB: string;
  statementBody: string;
  statementTags: string;
  filmKicker: string;
  filmTitle: string;
  filmBadge: string;
  playLabel: string;
  watchOnYouTube: string;
  filmLength: string;
  groupKicker: string;
  groupTitleA: string;
  groupTitleB: string;
  groupIntro: string;
  proofTitleA: string;
  proofTitleB: string;
  proofIntro: string;
  facts: { k: string; v: string }[];
  stepsHeading: string;
  steps: { title: string; body: string }[];
  closeBody: string;
  packsLink: string;
  wantInLink: string;
  faqHeading: string;
  faq: { q: string; a: string }[];
  footerMadeBy: string;
  footerSee: string;
  footerAnd: string;
  footerDesktop: string;
  footerEnd: string;
  /** Said on translated pages: the tool's own screens are in English. Empty in English. */
  toolNote: string;
  compare: CompareLabels;
  examples: { occlusion: Example; studio: Example; fiveFriends: Example; huddle: Example };
}

const en: HsCopy = {
  metaTitle: `${NAME}: Put Any Head in Any Photo`,
  metaDescription:
    "Swap the whole head in a portrait or a group photo: face, hair and head shape come from the new head, and the body, the pose and everyone else stay exactly as they were. Up to 4 variations at a time.",
  tagline: "Starring you.",
  kicker: "A NanoPocket original",
  heroLine: "Put any head in any photo, portrait or group shot. The new face, the new hair, the same scene.",
  ctaOpen: "Step on set",
  ctaSoon: "Opening soon",
  watchFilm: "Watch the film on YouTube",
  heroNote: `${CREDITS} credits an image · new accounts get free credits · a failed swap costs nothing`,
  teaserAlt: "A still from the HeadSwap Pro launch film: a studio portrait before and after the swap",
  statementA: "One new head.",
  statementB: "Any photo.",
  statementBody:
    "Not just the face: the hair and the shape of the head come with it. And everything you did not ask to change stays exactly as it was.",
  statementTags: "Portraits · group shots · mirror selfies · studio work",
  filmKicker: "The film",
  filmTitle: `${NAME}: the launch film`,
  filmBadge: "The launch film · 0:53",
  playLabel: "Play",
  watchOnYouTube: "Watch on YouTube",
  filmLength: "53 seconds",
  groupKicker: "New in HeadSwap Pro",
  groupTitleA: "Pick one head in a crowd.",
  groupTitleB: "Even from below.",
  groupIntro:
    "Our earlier head swap took one face per photo. HeadSwap Pro finds everyone in the photo, you click the one to change, and only that head changes. The same new head is used in both photos below.",
  proofTitleA: "Same photos.",
  proofTitleB: "Better heads.",
  proofIntro:
    "Each result is a single run with default settings and no retouching. Drag the slider, and switch between our earlier head swap and the original photo.",
  facts: [
    { k: "The whole head", v: "Face, hair and head shape all come from the new head, not just the face." },
    { k: "Pick one head in a crowd", v: "Click the person to recast. Everyone else, and the whole scene, stay exactly as they are. Our earlier head swap took one face per photo." },
    { k: "Any angle", v: "The new head is rebuilt in the pose of the head it replaces: turned to the side, tilted back, even seen from below." },
    { k: "Several takes", v: `Ask for up to ${MAX} variations in one go and pick the best.` },
    { k: "Full size", v: "The result keeps your photo's resolution. Drop in a big image, get a big image back." },
  ],
  stepsHeading: "Three steps to the premiere",
  steps: [
    { title: "Bring the scene", body: "Upload the photo you want to change. People are found automatically. In a group shot, click the one to recast." },
    { title: "Cast the lead", body: "Upload the new head: a clear, front-facing photo works best. Its face and its hairstyle come along." },
    { title: "Roll", body: `Choose 1 to ${MAX} variations and press Swap. A portrait takes about 40 seconds. Drag the slider to compare before and after.` },
  ],
  closeBody: `${CREDITS} credits (${USD}) an image. New accounts get free credits, and a swap that fails costs nothing.`,
  packsLink: "See credit packs",
  wantInLink: "Tell us you want in",
  faqHeading: "Before you roll",
  faq: [
    {
      q: "What does it cost?",
      a: `${CREDITS} credits per image (${USD}). Four variations cost four times as much. The price is shown on the button before you press it, and a swap that fails costs nothing. New accounts get free credits.`,
    },
    {
      q: "Is there a watermark?",
      a: "Results from an account that has never bought credits carry a small NanoPocket.ai watermark. Buy credits once and your results are clean from then on, whatever your balance.",
    },
    {
      q: "What photos work best?",
      a: "For the new head, a clear, front-facing photo with the face fully visible. For the scene photo, any portrait or group photo in which the person you want to change shows their face. Photos up to 25 MB in JPG, PNG or WebP.",
    },
    {
      q: "How long are my pictures kept?",
      a: "Your uploaded photo is kept for up to 3 hours so you can try several heads on it. A finished image can be downloaded for 24 hours.",
    },
    {
      q: "Can I use anyone's photo?",
      a: "Only use photos of people who have agreed to it. You are responsible for making sure your use of the results complies with the law and with other people's rights.",
    },
  ],
  footerMadeBy: `${NAME} is made by NanoPocket.ai.`,
  footerSee: "For the other tools, see",
  footerAnd: "and the",
  footerDesktop: "desktop apps",
  footerEnd: ".",
  toolNote: "",
  compare: {
    vsEarlier: "vs earlier head swap",
    vsOriginal: "vs original photo",
    originalVsPro: "Original photo vs HeadSwap Pro",
    groupLabel: "Compare HeadSwap Pro with",
    newHead: "the new head",
    newHeadAlt: "The new head used",
    earlierTag: "Earlier",
    originalTag: "Original",
    resultAlt: "{title}: result with HeadSwap Pro",
    earlierAlt: "{title}: result of the earlier head swap",
    originalAlt: "{title}: the original photo",
    sliderEarlier: "Compare the earlier head swap with HeadSwap Pro",
    sliderOriginal: "Compare the original with HeadSwap Pro",
  },
  examples: {
    occlusion: {
      title: "A mirror, two fingers on the cheek, a blurred shoulder in front",
      note: "The head is swapped and nothing else: the reflection, the hand on the face and the foreground all stay as shot.",
    },
    studio: {
      title: "An editorial shot with a film camera, a braided strap and art-directed makeup",
      note: "For studio and product work the styling has to survive the swap. Hands and strap stay in front of the face, and the makeup and gaze stay with the original photo.",
    },
    fiveFriends: {
      title: "Five friends laughing. One new head.",
      note: "The man in the middle gets the new head, hair included. The other four are not touched: same faces, same hair, same suits and ties, same trees behind them.",
    },
    huddle: {
      title: "A huddle, seen from below",
      note: "A low camera looking straight up at five heads, every one at a steep angle. The man in the red shirt gets the new head in the same tilt and the same grin, and the four people around him stay exactly as shot.",
    },
  },
};

const zhCN: HsCopy = {
  metaTitle: `${NAME}:AI 换头,把新的头换进任何照片`,
  metaDescription: `在线 AI 换头:脸、发型和头型都来自新头,身体、姿势和照片里的其他人保持原样。合影里可以只换一个人,侧脸、仰拍等大角度也能换,一次最多 ${MAX} 个结果。每张 ${CREDITS} 积分,新用户送免费积分。`,
  tagline: "主角,就是你。",
  kicker: "NanoPocket 原创出品",
  heroLine: "把新的头换进任何照片,单人照或合影都可以。新的脸、新的发型,同一个场景。",
  ctaOpen: "立即开拍",
  ctaSoon: "即将开放",
  watchFilm: "在 YouTube 观看宣传片",
  heroNote: `每张 ${CREDITS} 积分 · 新用户送免费积分 · 换头失败不扣费`,
  teaserAlt: "HeadSwap Pro 宣传片画面:一张棚拍人像换头前后的对比",
  statementA: "一个新头。",
  statementB: "任何照片。",
  statementBody: "不只是换脸:发型和头型也一起换过来。你没要求改的地方,全部保持原样。",
  statementTags: "人像 · 合影 · 镜子自拍 · 棚拍",
  filmKicker: "宣传片",
  filmTitle: `${NAME}:宣传片`,
  filmBadge: "宣传片 · 0:53",
  playLabel: "播放",
  watchOnYouTube: "在 YouTube 观看",
  filmLength: "53 秒",
  groupKicker: "HeadSwap Pro 新能力",
  groupTitleA: "合影里精准换一个人。",
  groupTitleB: "仰拍也可以。",
  groupIntro:
    "我们之前的换头,一张照片只能换一张脸。HeadSwap Pro 会找出照片里的每一个人,你点选要换的那一位,只有他的头会变。下面两张照片用的是同一个新头。",
  proofTitleA: "同样的照片。",
  proofTitleB: "更好的头。",
  proofIntro: "每个结果都是默认设置下只跑一次,没有任何修图。拖动滑块,还可以在“我们之前的换头”和“原图”之间切换对比。",
  facts: [
    { k: "整个头", v: "脸、发型和头型都来自新头,而不只是换一张脸。" },
    { k: "合影里只换一个人", v: "点选要换的人,其他人和整个场景完全不变。我们之前的换头一张照片只能换一张脸。" },
    { k: "任何角度", v: "新头会按照被替换那个头的姿势重建:侧脸、仰头,甚至从下往上拍都可以。" },
    { k: "一次多个结果", v: `一次最多生成 ${MAX} 个结果,挑出最满意的那个。` },
    { k: "原图尺寸", v: "结果保持你照片的原始分辨率。放进大图,拿回大图。" },
  ],
  stepsHeading: "三步开拍",
  steps: [
    { title: "上传场景", body: "上传你想修改的照片,系统会自动找出照片里的人。合影里点选要换的那一位。" },
    { title: "选定主角", body: "上传新头的照片:清晰的正脸照效果最好。脸和发型会一起换过去。" },
    { title: "开拍", body: `选择 1 到 ${MAX} 个结果,点击 Swap。一张人像大约 40 秒。拖动滑块对比换头前后。` },
  ],
  closeBody: `每张 ${CREDITS} 积分(${USD})。新用户送免费积分,换头失败不扣费。`,
  packsLink: "查看积分套餐",
  wantInLink: "告诉我们你想用",
  faqHeading: "开拍之前",
  faq: [
    {
      q: "多少钱?",
      a: `每张 ${CREDITS} 积分(${USD})。生成 4 个结果就是 4 倍价格。按下按钮之前,按钮上就会显示价格;换头失败不扣费。新用户送免费积分。`,
    },
    {
      q: "有水印吗?",
      a: "从未购买过积分的账号,结果上会带一个小的 NanoPocket.ai 水印。只要购买过一次积分,之后的结果都没有水印,与余额多少无关。",
    },
    {
      q: "什么样的照片效果最好?",
      a: "新头请用清晰的正脸照,脸部完整可见。场景照片可以是任何人像或合影,只要你要换的那个人露出了脸。支持 25 MB 以内的 JPG、PNG 或 WebP。",
    },
    {
      q: "我的照片会保存多久?",
      a: "上传的照片最多保留 3 小时,方便你在同一张照片上试几个不同的头。生成的结果可以在 24 小时内下载。",
    },
    {
      q: "可以用任何人的照片吗?",
      a: "只能使用本人同意的照片。你需要确保对结果的使用符合法律,并且不侵犯他人的权利。",
    },
  ],
  footerMadeBy: `${NAME} 由 NanoPocket.ai 出品。`,
  footerSee: "其他工具请看",
  footerAnd: "和",
  footerDesktop: "桌面版软件",
  footerEnd: "。",
  toolNote: "换头工具的界面目前只有英文。",
  compare: {
    vsEarlier: "对比之前的换头",
    vsOriginal: "对比原图",
    originalVsPro: "原图 vs HeadSwap Pro",
    groupLabel: "选择对比对象",
    newHead: "新头",
    newHeadAlt: "使用的新头",
    earlierTag: "之前",
    originalTag: "原图",
    resultAlt: "{title}:HeadSwap Pro 的结果",
    earlierAlt: "{title}:之前换头的结果",
    originalAlt: "{title}:原图",
    sliderEarlier: "对比之前的换头和 HeadSwap Pro",
    sliderOriginal: "对比原图和 HeadSwap Pro",
  },
  examples: {
    occlusion: {
      title: "镜子前,两根手指贴着脸颊,前景有一个虚化的肩膀",
      note: "只换了头,其他都没动:镜中的倒影、贴在脸上的手和前景都保持拍摄时的样子。",
    },
    studio: {
      title: "一张杂志风格的照片:胶片相机、编织背带和精心设计的妆容",
      note: "棚拍和产品图要求造型在换头后依然保留。手和背带仍然挡在脸前,妆容和眼神也保持原图的样子。",
    },
    fiveFriends: {
      title: "五个朋友在大笑。只换一个头。",
      note: "中间的男士换上了新头,连头发一起换。其他四个人完全没动:同样的脸、同样的发型、同样的西装和领带,背后的树也一样。",
    },
    huddle: {
      title: "一圈人,从下往上拍",
      note: "低机位正对上方拍五个头,每个头的角度都很大。穿红衣服的男士换上了新头,保持同样的倾斜角度和同样的笑容,周围四个人和拍摄时一模一样。",
    },
  },
};

const ja: HsCopy = {
  metaTitle: `${NAME}:AIヘッドスワップ、どんな写真にも新しい頭を`,
  metaDescription: `オンラインで頭ごと入れ替えるAIヘッドスワップ。顔・髪型・頭の形が新しくなり、体やポーズ、写真のほかの人はそのまま。集合写真で一人だけ、横顔やあおりなど急な角度にも対応し、一度に最大${MAX}パターン。1枚${CREDITS}クレジット、新規アカウントには無料クレジット付き。`,
  tagline: "主役は、あなた。",
  kicker: "NanoPocket オリジナル",
  heroLine: "どんな写真にも、新しい頭を。ポートレートでも集合写真でも。新しい顔、新しい髪型、同じシーン。",
  ctaOpen: "撮影を始める",
  ctaSoon: "まもなく公開",
  watchFilm: "YouTube で紹介映像を見る",
  heroNote: `1枚 ${CREDITS} クレジット · 新規アカウントには無料クレジット · 失敗したスワップは無料`,
  teaserAlt: "HeadSwap Pro 紹介映像の一場面:スタジオポートレートのスワップ前と後",
  statementA: "新しい頭を、ひとつ。",
  statementB: "どんな写真にも。",
  statementBody: "顔だけではありません。髪型も頭の形も一緒に変わります。そして、変えたくない部分はすべてそのまま。",
  statementTags: "ポートレート · 集合写真 · 鏡の自撮り · スタジオ撮影",
  filmKicker: "紹介映像",
  filmTitle: `${NAME}:紹介映像`,
  filmBadge: "紹介映像 · 0:53",
  playLabel: "再生",
  watchOnYouTube: "YouTube で見る",
  filmLength: "53 秒",
  groupKicker: "HeadSwap Pro の新機能",
  groupTitleA: "大勢の中から、一人だけ。",
  groupTitleB: "下からのアングルでも。",
  groupIntro:
    "以前のヘッドスワップは、1枚の写真で1つの顔しか扱えませんでした。HeadSwap Pro は写真に写る全員を見つけ、クリックした一人の頭だけを入れ替えます。下の2枚には同じ新しい頭を使っています。",
  proofTitleA: "同じ写真。",
  proofTitleB: "もっと自然な頭。",
  proofIntro: "どの結果もデフォルト設定で1回生成しただけで、レタッチはしていません。スライダーを動かし、以前のヘッドスワップと元の写真を切り替えて比べてみてください。",
  facts: [
    { k: "頭まるごと", v: "顔だけでなく、髪型も頭の形も新しい頭から引き継ぎます。" },
    { k: "大勢の中から一人だけ", v: "入れ替えたい人をクリック。ほかの人もシーン全体も、そのまま残ります。以前のヘッドスワップは1枚に1つの顔だけでした。" },
    { k: "どんな角度でも", v: "新しい頭は、置き換える頭のポーズに合わせて作り直されます。横向きでも、のけぞっていても、下から撮っていても。" },
    { k: "複数のテイク", v: `一度に最大${MAX}パターンを生成し、いちばん良いものを選べます。` },
    { k: "元のサイズのまま", v: "結果は元の写真の解像度を保ちます。大きな画像を入れれば、大きな画像が返ってきます。" },
  ],
  stepsHeading: "公開までの3ステップ",
  steps: [
    { title: "シーンを用意", body: "変えたい写真をアップロード。人物は自動で検出されます。集合写真なら、入れ替えたい一人をクリック。" },
    { title: "主役を決める", body: "新しい頭の写真をアップロード。正面を向いたはっきりした写真が最適です。顔と髪型が一緒に移ります。" },
    { title: "撮影開始", body: `1〜${MAX}パターンを選んで Swap を押すだけ。ポートレート1枚で約40秒。スライダーで前と後を比べられます。` },
  ],
  closeBody: `1枚 ${CREDITS} クレジット(${USD})。新規アカウントには無料クレジット付きで、失敗したスワップは無料です。`,
  packsLink: "クレジットパックを見る",
  wantInLink: "使いたいと伝える",
  faqHeading: "撮影の前に",
  faq: [
    {
      q: "料金はいくらですか?",
      a: `1枚 ${CREDITS} クレジット(${USD})。4パターンなら4倍です。料金はボタンを押す前にボタン上に表示され、失敗したスワップは無料です。新規アカウントには無料クレジットが付きます。`,
    },
    {
      q: "透かしは入りますか?",
      a: "一度もクレジットを購入していないアカウントの結果には、小さな NanoPocket.ai の透かしが入ります。一度購入すれば、残高にかかわらず以降の結果に透かしは入りません。",
    },
    {
      q: "どんな写真が向いていますか?",
      a: "新しい頭には、顔全体がはっきり見える正面の写真。シーンの写真は、入れ替えたい人の顔が写っていれば、ポートレートでも集合写真でもかまいません。JPG・PNG・WebP、25 MB まで。",
    },
    {
      q: "写真はどのくらい保存されますか?",
      a: "アップロードした写真は、いくつかの頭を試せるよう最大3時間保存されます。完成した画像は24時間ダウンロードできます。",
    },
    {
      q: "誰の写真でも使えますか?",
      a: "本人の同意を得た写真だけを使ってください。結果の利用が法律や他人の権利に反しないようにする責任は、利用者にあります。",
    },
  ],
  footerMadeBy: `${NAME} は NanoPocket.ai が提供しています。`,
  footerSee: "ほかのツールは",
  footerAnd: "と",
  footerDesktop: "デスクトップアプリ",
  footerEnd: "をご覧ください。",
  toolNote: "ツールの画面は現在、英語のみです。",
  compare: {
    vsEarlier: "以前のヘッドスワップと比較",
    vsOriginal: "元の写真と比較",
    originalVsPro: "元の写真 vs HeadSwap Pro",
    groupLabel: "比較する対象",
    newHead: "新しい頭",
    newHeadAlt: "使用した新しい頭",
    earlierTag: "以前",
    originalTag: "元の写真",
    resultAlt: "{title}:HeadSwap Pro の結果",
    earlierAlt: "{title}:以前のヘッドスワップの結果",
    originalAlt: "{title}:元の写真",
    sliderEarlier: "以前のヘッドスワップと HeadSwap Pro を比較",
    sliderOriginal: "元の写真と HeadSwap Pro を比較",
  },
  examples: {
    occlusion: {
      title: "鏡の前、頬に2本の指、手前にぼけた肩",
      note: "入れ替えたのは頭だけ。鏡の映り込みも、顔に触れた手も、手前の肩も、撮影したときのままです。",
    },
    studio: {
      title: "フィルムカメラ、編み込みのストラップ、作り込んだメイクのエディトリアル写真",
      note: "スタジオや商品の撮影では、スワップ後もスタイリングが残っていなければなりません。手とストラップは顔の前に残り、メイクと視線も元の写真のままです。",
    },
    fiveFriends: {
      title: "笑い合う5人の友人。新しい頭はひとつ。",
      note: "真ん中の男性に、髪ごと新しい頭を。ほかの4人は一切変わりません。同じ顔、同じ髪、同じスーツとネクタイ、後ろの木々もそのままです。",
    },
    huddle: {
      title: "下から見上げた円陣",
      note: "低い位置から5人の頭を真上に見上げたカット。どの頭も大きく傾いています。赤いシャツの男性は同じ傾き、同じ笑顔のまま新しい頭に。周りの4人は撮影したままです。",
    },
  },
};

export const HS_COPY: Record<HsLocale, HsCopy> = { en, "zh-CN": zhCN, ja };
