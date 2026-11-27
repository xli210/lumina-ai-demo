/**
 * Words for the Black Friday hub (/black-friday) and the homepage banner, per language.
 *
 * Prices, percentages and dates are NOT in here: the page fills them in from lib/black-friday.ts,
 * lib/products.ts and lib/credit-packs.ts, in English on every locale like the rest of the billing
 * text, so a translation can never state a wrong price. `{placeholders}` are filled by the page.
 */
import type { AppLocale } from "@/lib/i18n/locales";

export interface BlackFridayCopy {
  pageTitle: string;
  pageDescription: string;
  kicker: string;
  heading: string;
  intro: string;
  /** Shown before the sale starts. {date} */
  upcoming: string;
  /** Shown during the sale. {date} {left} */
  running: string;
  /** Shown after the sale. */
  ended: string;
  offersHeading: string;
  studioPro: { badge: string; title: string; body: string; bullets: string[]; cta: string; more: string };
  vPro: { badge: string; title: string; body: string; bullets: string[]; cta: string; more: string; noTrial: string };
  credits: { badge: string; title: string; body: string; thPack: string; thPrice: string; thCredits: string; starterNote: string; autoNote: string; cta: string };
  neo: { badge: string; title: string; body: string; cta: string };
  /** Half-price photo face swaps for accounts that have bought credits. {member} {regular}: credits per face. */
  photoSwap: { badge: string; title: string; body: string; cta: string };
  apps: { badge: string; title: string; body: string; trialNote: string; cta: string };
  finePrintHeading: string;
  finePrint: string[];
  banner: { title: string; body: string; cta: string };
  /** The homepage's full-width Black Friday section. Prices are filled in by the page, in English. */
  takeover?: BlackFridayTakeoverCopy;
}

export interface BlackFridayTakeoverCopy {
  kicker: string;
  /** The giant two-line headline, e.g. "Black" / "Friday". */
  line1: string;
  line2: string;
  sub: string;
  upTo: string;
  off: string;
  startsIn: string;
  endsIn: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  cta: string;
  ctaCredits: string;
  tiles: {
    studioPro: { title: string; line: string };
    vPro: { title: string; line: string; tag: string };
    credits: { title: string; line: string };
    apps: { title: string; line: string };
  };
}

const en: BlackFridayCopy = {
  pageTitle: "Black Friday at NanoPocket: offers until Dec 24",
  pageDescription:
    "A month of Black Friday offers: Nano FaceStudio Pro 1.2 with batch swap and a Mac version, the launch of Nano FaceStudio V Pro, up to 30% off credit packs, and 30% off the other desktop apps.",
  kicker: "Black Friday · one month",
  heading: "Black Friday runs for a whole month",
  intro:
    "From Nov 23 to Dec 24 (Pacific time), every offer below applies on its own, with no code to enter. The price you see at checkout is the price you pay.",
  upcoming: "The offers start on {date}. Until then, the regular prices apply.",
  running: "On now, until {date} · {left}",
  ended: "Black Friday has ended. Thank you to everyone who joined in.",
  offersHeading: "This month's offers",
  studioPro: {
    badge: "New version",
    title: "Nano FaceStudio Pro 1.2: batch face swap, now on Mac",
    body:
      "Our desktop face studio now swaps a whole shoot in one go: add the photos, pick one reference, press Start. Version 1.2 also runs natively on Apple Silicon Macs.",
    bullets: [
      "Batch swap: one reference across any number of photos, while you keep editing",
      "Group photos: choose one person, several, or everyone",
      "New native Mac app for Apple Silicon (M1 or newer, macOS 14+)",
      "Everything runs on your own computer; your photos are never uploaded",
    ],
    cta: "Buy Nano FaceStudio Pro",
    more: "See what's new in 1.2",
  },
  vPro: {
    badge: "New app",
    title: "Nano FaceStudio V Pro: video face swap on your own GPU",
    body:
      "Our new desktop app swaps a person's face in a video on your own NVIDIA GPU, with no credits and no queue. Fast or Best quality, output in 1080p or 4K.",
    bullets: [
      "Pick the person, add a photo of the new face, and keep everything else as filmed",
      "Enhance-only mode, optional lip sync, and a batch queue of up to 50 videos",
      "Original sound kept; MP4 export",
      "Windows with an NVIDIA RTX GPU (8 GB of video memory or more)",
    ],
    cta: "Buy Nano FaceStudio V Pro",
    more: "See what it does",
    noTrial: "No free trial for this app. You can try video face swap in the browser first.",
  },
  credits: {
    badge: "Credits",
    title: "Up to 30% off credit packs",
    body: "Credits pay for the online tools: video face swap, head swap, Face Studio and image edit. The bigger the pack, the bigger the discount, and every pack keeps all of its credits.",
    thPack: "Pack",
    thPrice: "Black Friday price",
    thCredits: "Credits you get",
    starterNote: "The $5 Starter pack keeps its regular price.",
    autoNote: "Auto top-ups made during the sale are charged the sale price too. Credits never expire.",
    cta: "Buy credits",
  },
  neo: {
    badge: "Neo launch offer, extended",
    title: "Neo videos cost 30% fewer credits",
    body:
      "Neo is our new video model: it redraws the face frame by frame, so the result looks like your photo. Until Dec 4, every Neo video costs 30% fewer credits, and this stacks with the credit pack discount.",
    cta: "Try Neo",
  },
  photoSwap: {
    badge: "Members only",
    title: "Photo face swaps at half price",
    body:
      "Once your account has bought credits, any credit pack, a photo face swap in Face Studio Online costs {member} credits per face instead of {regular}. Accounts that have not bought credits pay the regular {regular}. Head swaps keep their price.",
    cta: "Open Face Studio",
  },
  apps: {
    badge: "Desktop apps",
    title: "30% off our other desktop apps",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh and Nano VideoGen: one-time licences, no subscription.",
    trialNote: "Each still comes with its 7-day free trial.",
    cta: "See all desktop apps",
  },
  finePrintHeading: "The small print",
  finePrint: [
    "Prices are in US dollars.",
    "Sale prices apply to purchases made during the sale. Earlier purchases are not repriced.",
    "Desktop licences are one-time payments, with no subscription. Credits never expire.",
    "Nano FaceStudio V Pro is a new app. $84.90 is its launch price, not a discount from an earlier price.",
  ],
  takeover: {
    kicker: "One month · Nov 23 – Dec 24",
    line1: "Black",
    line2: "Friday",
    sub: "A whole month of offers on our desktop studios and online credits. No codes, no catches: the price at checkout is the price you pay.",
    upTo: "Up to",
    off: "off credits",
    startsIn: "Starts in",
    endsIn: "Ends in",
    days: "days",
    hours: "hours",
    minutes: "min",
    seconds: "sec",
    cta: "See all offers",
    ctaCredits: "Buy credits",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "Batch face swap, now on Mac" },
      vPro: { title: "FaceStudio V Pro", line: "Video face swap on your own GPU", tag: "New app" },
      credits: { title: "Credit packs", line: "Bigger pack, bigger discount" },
      apps: { title: "Desktop apps", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday: a whole month of offers",
    body: "FaceStudio Pro 1.2 with batch swap and Mac, the new FaceStudio V Pro, up to 30% off credits, 30% off the other apps.",
    cta: "See the offers",
  },
};

const zhCN: BlackFridayCopy = {
  pageTitle: "NanoPocket Black Friday 黑五：优惠持续到 12 月 24 日",
  pageDescription:
    "为期一个月的 Black Friday 优惠：支持批量换脸和 Mac 版的 Nano FaceStudio Pro 1.2、全新 Nano FaceStudio V Pro 上市、积分包最高优惠 30%，其他桌面应用优惠 30%。",
  kicker: "Black Friday 黑五 · 为期一个月",
  heading: "Black Friday 黑五，整整一个月",
  intro:
    "从 11 月 23 日到 12 月 24 日（太平洋时间），以下每项优惠都会自动生效，无需输入优惠码。结账时看到的价格，就是你实际支付的价格。",
  upcoming: "优惠将于 {date} 开始。在此之前按常规价格计算。",
  running: "进行中，截至 {date} · {left}",
  ended: "Black Friday 活动已结束。感谢每一位参与的朋友。",
  offersHeading: "本月优惠",
  studioPro: {
    badge: "新版本",
    title: "Nano FaceStudio Pro 1.2：批量换脸，现已支持 Mac",
    body:
      "我们的桌面换脸工作室现在可以一次处理整组照片：添加照片，选一张参考脸，点击开始。1.2 版还可在 Apple Silicon Mac 上原生运行。",
    bullets: [
      "批量换脸：一张参考脸可用于任意数量的照片，处理期间你可以继续编辑",
      "合影：可选择一个人、几个人或所有人",
      "全新原生 Mac 应用，适用于 Apple Silicon（M1 或更新机型，macOS 14 及以上）",
      "全部在你自己的电脑上运行，照片绝不会上传",
    ],
    cta: "购买 Nano FaceStudio Pro",
    more: "查看 1.2 版新功能",
  },
  vPro: {
    badge: "新应用",
    title: "Nano FaceStudio V Pro：用你自己的 GPU 做视频换脸",
    body:
      "我们的全新桌面应用在你自己的 NVIDIA GPU 上为视频中的人物换脸，不消耗积分，无需排队。可选 Fast 或 Best 质量，输出 1080p 或 4K。",
    bullets: [
      "选择人物，添加新面孔的照片，其余画面保持原样",
      "仅增强模式、可选口型同步，批量队列最多 50 个视频",
      "保留原声，导出 MP4",
      "需要 Windows 和 NVIDIA RTX GPU（显存 8 GB 或以上）",
    ],
    cta: "购买 Nano FaceStudio V Pro",
    more: "了解它能做什么",
    noTrial: "此应用不提供免费试用。你可以先在浏览器中试试视频换脸。",
  },
  credits: {
    badge: "积分",
    title: "积分包最高优惠 30%",
    body: "积分用于在线工具：视频换脸、换头、Face Studio 和图片编辑。积分包越大，折扣越大，每个积分包的积分数量保持不变。",
    thPack: "积分包",
    thPrice: "Black Friday 价格",
    thCredits: "获得积分",
    starterNote: "$5 Starter 积分包保持常规价格。",
    autoNote: "活动期间的自动充值同样按优惠价收费。积分永不过期。",
    cta: "购买积分",
  },
  neo: {
    badge: "Neo 上线优惠已延长",
    title: "Neo 视频少用 30% 积分",
    body:
      "Neo 是我们的全新视频模型：它逐帧重绘面部，让结果看起来就像你的照片。即日起至 12 月 4 日，每个 Neo 视频少用 30% 积分，并可与积分包折扣叠加。",
    cta: "试用 Neo",
  },
  photoSwap: {
    badge: "充值会员专享",
    title: "照片换脸半价",
    body:
      "账号只要充值过任意积分包，在 Face Studio Online 中照片换脸每张脸只需 {member} 积分，原价 {regular}。未充值的账号仍按原价 {regular} 积分。换头价格不变。",
    cta: "打开 Face Studio",
  },
  apps: {
    badge: "桌面应用",
    title: "其他桌面应用优惠 30%",
    body: "Nano ImageEdit、Nano VideoEnhance、Nano ImageEnh 和 Nano VideoGen：一次性买断授权，无需订阅。",
    trialNote: "每款应用仍提供 7 天免费试用。",
    cta: "查看所有桌面应用",
  },
  finePrintHeading: "细则",
  finePrint: [
    "价格以美元计。",
    "优惠价适用于活动期间的购买。此前的购买不会按新价格调整。",
    "桌面应用授权为一次性付款，无需订阅。积分永不过期。",
    "Nano FaceStudio V Pro 是一款新应用。$84.90 是它的上市价格，并非在此前价格基础上的折扣。",
  ],
  takeover: {
    kicker: "为期一个月 · 11 月 23 日 – 12 月 24 日",
    line1: "黑五",
    line2: "优惠月",
    sub: "桌面工作室和在线积分，整整一个月的优惠。无需优惠码，没有附加条件：结账时的价格就是你实际支付的价格。",
    upTo: "积分最高",
    off: "优惠",
    startsIn: "距开始",
    endsIn: "距结束",
    days: "天",
    hours: "小时",
    minutes: "分",
    seconds: "秒",
    cta: "查看全部优惠",
    ctaCredits: "购买积分",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "批量换脸，现已支持 Mac" },
      vPro: { title: "FaceStudio V Pro", line: "用你自己的 GPU 做视频换脸", tag: "新应用" },
      credits: { title: "积分包", line: "积分包越大，折扣越大" },
      apps: { title: "桌面应用", line: "ImageEdit、VideoEnhance、ImageEnh、VideoGen" },
    },
  },
  banner: {
    title: "Black Friday：整整一个月的优惠",
    body: "FaceStudio Pro 1.2 支持批量换脸和 Mac，全新 FaceStudio V Pro，积分最高优惠 30%，其他应用优惠 30%。",
    cta: "查看优惠",
  },
};

const ja: BlackFridayCopy = {
  pageTitle: "NanoPocket の Black Friday：12月24日までのオファー",
  pageDescription:
    "1か月間の Black Friday オファー：一括スワップと Mac 版に対応した Nano FaceStudio Pro 1.2、Nano FaceStudio V Pro の発売、クレジットパック最大 30% オフ、その他のデスクトップアプリ 30% オフ。",
  kicker: "Black Friday · 1か月間",
  heading: "Black Friday を、まる1か月",
  intro:
    "11月23日から12月24日（太平洋時間）まで、以下のオファーはそれぞれ自動で適用され、コードの入力は不要です。チェックアウトで表示される価格が、そのままお支払い額です。",
  upcoming: "オファーは {date} に始まります。それまでは通常価格です。",
  running: "開催中：{date} まで · {left}",
  ended: "Black Friday は終了しました。ご参加いただいた皆さま、ありがとうございました。",
  offersHeading: "今月のオファー",
  studioPro: {
    badge: "新バージョン",
    title: "Nano FaceStudio Pro 1.2：一括顔交換、Mac にも対応",
    body:
      "デスクトップ版フェイススタジオで、撮影した写真をまとめて交換できるようになりました。写真を追加し、参照画像を1枚選んで、開始を押すだけです。バージョン 1.2 は Apple Silicon 搭載の Mac でもネイティブに動作します。",
    bullets: [
      "一括スワップ：1枚の参照画像を何枚の写真にも適用。処理中も編集を続けられます",
      "集合写真：1人、複数人、または全員を選べます",
      "Apple Silicon 向けの新しいネイティブ Mac アプリ（M1 以降、macOS 14 以降）",
      "すべてお使いのコンピューター上で動作し、写真がアップロードされることはありません",
    ],
    cta: "Nano FaceStudio Pro を購入",
    more: "1.2 の新機能を見る",
  },
  vPro: {
    badge: "新アプリ",
    title: "Nano FaceStudio V Pro：自分の GPU で動画の顔交換",
    body:
      "新しいデスクトップアプリで、動画に映る人物の顔をお手元の NVIDIA GPU で交換できます。クレジットも順番待ちも不要です。画質は Fast と Best から選べ、1080p または 4K で出力します。",
    bullets: [
      "人物を選び、新しい顔の写真を追加。それ以外は撮影したままです",
      "補正のみモード、リップシンク（任意）、最大 50 本の一括キュー",
      "元の音声はそのまま、MP4 で書き出し",
      "NVIDIA RTX GPU（ビデオメモリ 8 GB 以上）搭載の Windows",
    ],
    cta: "Nano FaceStudio V Pro を購入",
    more: "できることを見る",
    noTrial: "このアプリには無料体験版がありません。まずはブラウザで動画の顔交換をお試しください。",
  },
  credits: {
    badge: "クレジット",
    title: "クレジットパックが最大 30% オフ",
    body: "クレジットはオンラインツールに使えます：動画の顔交換、ヘッドスワップ、Face Studio、画像編集。パックが大きいほど割引も大きく、どのパックもクレジット数はそのままです。",
    thPack: "パック",
    thPrice: "Black Friday 価格",
    thCredits: "もらえるクレジット",
    starterNote: "$5 の Starter パックは通常価格のままです。",
    autoNote: "セール期間中の自動チャージもセール価格で請求されます。クレジットに有効期限はありません。",
    cta: "クレジットを購入",
  },
  neo: {
    badge: "Neo ローンチ特典を延長",
    title: "Neo 動画のクレジットが 30% 少なく",
    body:
      "Neo は新しい動画モデルです。顔を1フレームずつ描き直すので、仕上がりがあなたの写真にそっくりになります。12 月 4 日まで、すべての Neo 動画が 30% 少ないクレジットで作れ、クレジットパックの割引とも併用できます。",
    cta: "Neo を試す",
  },
  photoSwap: {
    badge: "購入者限定",
    title: "写真の顔交換が半額",
    body:
      "どのクレジットパックでも一度購入したアカウントなら、Face Studio Online の写真の顔交換が 1 顔あたり {regular} クレジットではなく {member} クレジットになります。購入していないアカウントは通常どおり {regular} クレジットです。ヘッドスワップの価格は変わりません。",
    cta: "Face Studio を開く",
  },
  apps: {
    badge: "デスクトップアプリ",
    title: "その他のデスクトップアプリが 30% オフ",
    body: "Nano ImageEdit、Nano VideoEnhance、Nano ImageEnh、Nano VideoGen：買い切りライセンスで、サブスクリプションはありません。",
    trialNote: "どのアプリも引き続き 7 日間の無料体験付きです。",
    cta: "デスクトップアプリをすべて見る",
  },
  finePrintHeading: "注意事項",
  finePrint: [
    "価格は米ドル表示です。",
    "セール価格はセール期間中のご購入に適用されます。それ以前のご購入の価格は変わりません。",
    "デスクトップライセンスは買い切りで、サブスクリプションはありません。クレジットに有効期限はありません。",
    "Nano FaceStudio V Pro は新しいアプリです。$84.90 は発売時の価格であり、以前の価格からの割引ではありません。",
  ],
  takeover: {
    kicker: "1か月間 · 11月23日〜12月24日",
    line1: "ブラック",
    line2: "フライデー",
    sub: "デスクトップスタジオとオンラインクレジットのオファーが、まる1か月続きます。コードも条件もなし。チェックアウトの価格が、そのままお支払い額です。",
    upTo: "クレジット最大",
    off: "オフ",
    startsIn: "開始まで",
    endsIn: "終了まで",
    days: "日",
    hours: "時間",
    minutes: "分",
    seconds: "秒",
    cta: "すべてのオファーを見る",
    ctaCredits: "クレジットを購入",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "一括顔交換、Mac にも対応" },
      vPro: { title: "FaceStudio V Pro", line: "自分の GPU で動画の顔交換", tag: "新アプリ" },
      credits: { title: "クレジットパック", line: "大きいパックほど割引も大きく" },
      apps: { title: "デスクトップアプリ", line: "ImageEdit、VideoEnhance、ImageEnh、VideoGen" },
    },
  },
  banner: {
    title: "Black Friday：まる1か月のオファー",
    body: "一括スワップと Mac 対応の FaceStudio Pro 1.2、新しい FaceStudio V Pro、クレジット最大 30% オフ、その他のアプリ 30% オフ。",
    cta: "オファーを見る",
  },
};

const ko: BlackFridayCopy = {
  pageTitle: "NanoPocket Black Friday: 12월 24일까지 이어지는 혜택",
  pageDescription:
    "한 달 동안 이어지는 Black Friday 혜택: 일괄 스왑과 Mac 버전을 갖춘 Nano FaceStudio Pro 1.2, Nano FaceStudio V Pro 출시, 크레딧 팩 최대 30% 할인, 다른 데스크톱 앱 30% 할인.",
  kicker: "Black Friday · 한 달간",
  heading: "Black Friday가 한 달 내내 이어집니다",
  intro:
    "11월 23일부터 12월 24일까지(태평양 시간), 아래 혜택은 각각 자동으로 적용되며 코드를 입력할 필요가 없습니다. 결제 화면에 보이는 가격이 실제로 결제하는 가격입니다.",
  upcoming: "혜택은 {date}에 시작됩니다. 그전까지는 정상가가 적용됩니다.",
  running: "진행 중, {date}까지 · {left}",
  ended: "Black Friday가 끝났습니다. 함께해 주신 모든 분께 감사드립니다.",
  offersHeading: "이번 달 혜택",
  studioPro: {
    badge: "새 버전",
    title: "Nano FaceStudio Pro 1.2: 일괄 얼굴 교체, 이제 Mac에서도",
    body:
      "데스크톱 얼굴 스튜디오가 이제 촬영분 전체를 한 번에 교체합니다. 사진을 추가하고, 기준 얼굴 하나를 고른 뒤, 시작을 누르세요. 버전 1.2는 Apple Silicon Mac에서도 네이티브로 실행됩니다.",
    bullets: [
      "일괄 스왑: 기준 얼굴 하나를 원하는 만큼의 사진에 적용하고, 그동안 편집을 계속할 수 있습니다",
      "단체 사진: 한 명, 여러 명 또는 전원을 선택",
      "Apple Silicon용 새 네이티브 Mac 앱(M1 이상, macOS 14 이상)",
      "모든 작업이 내 컴퓨터에서 실행되며 사진은 절대 업로드되지 않습니다",
    ],
    cta: "Nano FaceStudio Pro 구매",
    more: "1.2의 새 기능 보기",
  },
  vPro: {
    badge: "새 앱",
    title: "Nano FaceStudio V Pro: 내 GPU로 하는 동영상 얼굴 교체",
    body:
      "새 데스크톱 앱이 내 NVIDIA GPU에서 동영상 속 인물의 얼굴을 교체합니다. 크레딧도 대기열도 필요 없습니다. Fast 또는 Best 품질을 고르고 1080p나 4K로 출력하세요.",
    bullets: [
      "인물을 고르고 새 얼굴 사진을 추가하면, 나머지는 촬영한 그대로 유지됩니다",
      "보정 전용 모드, 선택형 립싱크, 최대 50개 동영상 일괄 대기열",
      "원본 소리 유지, MP4로 내보내기",
      "NVIDIA RTX GPU(비디오 메모리 8GB 이상)를 갖춘 Windows",
    ],
    cta: "Nano FaceStudio V Pro 구매",
    more: "기능 살펴보기",
    noTrial: "이 앱은 무료 체험판이 없습니다. 먼저 브라우저에서 동영상 얼굴 교체를 체험해 보세요.",
  },
  credits: {
    badge: "크레딧",
    title: "크레딧 팩 최대 30% 할인",
    body: "크레딧은 온라인 도구에 사용됩니다: 동영상 얼굴 교체, 헤드 스왑, Face Studio, 이미지 편집. 팩이 클수록 할인도 커지며, 모든 팩의 크레딧 수는 그대로입니다.",
    thPack: "팩",
    thPrice: "Black Friday 가격",
    thCredits: "받는 크레딧",
    starterNote: "$5 Starter 팩은 정상가를 유지합니다.",
    autoNote: "세일 기간 중 자동 충전도 세일 가격으로 결제됩니다. 크레딧은 만료되지 않습니다.",
    cta: "크레딧 구매",
  },
  neo: {
    badge: "Neo 출시 혜택 연장",
    title: "Neo 동영상 크레딧 30% 절약",
    body:
      "Neo는 새로운 동영상 모델입니다. 얼굴을 프레임마다 다시 그려서 결과물이 내 사진처럼 보입니다. 12월 4일까지 모든 Neo 동영상에 크레딧이 30% 적게 들며, 크레딧 팩 할인과 함께 적용됩니다.",
    cta: "Neo 사용해 보기",
  },
  photoSwap: {
    badge: "구매 회원 전용",
    title: "사진 얼굴 교체 반값",
    body:
      "크레딧 팩을 한 번이라도 구매한 계정은 Face Studio Online의 사진 얼굴 교체가 얼굴당 {regular} 크레딧 대신 {member} 크레딧입니다. 구매하지 않은 계정은 기존 가격 {regular} 크레딧이 그대로 적용됩니다. 헤드 스왑 가격은 바뀌지 않습니다.",
    cta: "Face Studio 열기",
  },
  apps: {
    badge: "데스크톱 앱",
    title: "다른 데스크톱 앱 30% 할인",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh, Nano VideoGen: 한 번 결제하는 라이선스, 구독 없음.",
    trialNote: "모든 앱에 7일 무료 체험이 그대로 제공됩니다.",
    cta: "모든 데스크톱 앱 보기",
  },
  finePrintHeading: "유의 사항",
  finePrint: [
    "가격은 미국 달러 기준입니다.",
    "세일 가격은 세일 기간 중 구매에 적용됩니다. 이전 구매의 가격은 다시 책정되지 않습니다.",
    "데스크톱 라이선스는 일회성 결제이며 구독이 없습니다. 크레딧은 만료되지 않습니다.",
    "Nano FaceStudio V Pro는 새로운 앱입니다. $84.90은 출시 가격이며, 이전 가격에서 할인된 것이 아닙니다.",
  ],
  takeover: {
    kicker: "한 달간 · 11월 23일 – 12월 24일",
    line1: "블랙",
    line2: "프라이데이",
    sub: "데스크톱 스튜디오와 온라인 크레딧 혜택이 한 달 내내 이어집니다. 코드도 조건도 없습니다. 결제 화면의 가격이 실제로 결제하는 가격입니다.",
    upTo: "크레딧 최대",
    off: "할인",
    startsIn: "시작까지",
    endsIn: "종료까지",
    days: "일",
    hours: "시간",
    minutes: "분",
    seconds: "초",
    cta: "모든 혜택 보기",
    ctaCredits: "크레딧 구매",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "일괄 얼굴 교체, 이제 Mac에서도" },
      vPro: { title: "FaceStudio V Pro", line: "내 GPU로 하는 동영상 얼굴 교체", tag: "새 앱" },
      credits: { title: "크레딧 팩", line: "팩이 클수록 할인도 커집니다" },
      apps: { title: "데스크톱 앱", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday: 한 달 내내 이어지는 혜택",
    body: "일괄 스왑과 Mac을 지원하는 FaceStudio Pro 1.2, 새로운 FaceStudio V Pro, 크레딧 최대 30% 할인, 다른 앱 30% 할인.",
    cta: "혜택 보기",
  },
};

const es: BlackFridayCopy = {
  pageTitle: "Black Friday en NanoPocket: ofertas hasta el 24 de diciembre",
  pageDescription:
    "Un mes de ofertas de Black Friday: Nano FaceStudio Pro 1.2 con cambio por lotes y versión para Mac, el lanzamiento de Nano FaceStudio V Pro, hasta un 30% de descuento en paquetes de créditos y un 30% de descuento en las demás apps de escritorio.",
  kicker: "Black Friday · un mes",
  heading: "Black Friday dura un mes entero",
  intro:
    "Del 23 de noviembre al 24 de diciembre (hora del Pacífico), cada oferta se aplica sola, sin códigos que introducir. El precio que ves al pagar es el precio que pagas.",
  upcoming: "Las ofertas empiezan el {date}. Hasta entonces, se aplican los precios habituales.",
  running: "Ya disponible, hasta el {date} · {left}",
  ended: "Black Friday ha terminado. Gracias a todos los que participaron.",
  offersHeading: "Las ofertas de este mes",
  studioPro: {
    badge: "Nueva versión",
    title: "Nano FaceStudio Pro 1.2: cambio de cara por lotes, ahora en Mac",
    body:
      "Nuestro estudio de caras para escritorio ahora cambia una sesión entera de una vez: añade las fotos, elige una referencia y pulsa Iniciar. La versión 1.2 también funciona de forma nativa en Mac con Apple Silicon.",
    bullets: [
      "Cambio por lotes: una referencia para todas las fotos que quieras, mientras sigues editando",
      "Fotos de grupo: elige una persona, varias o todas",
      "Nueva app nativa para Mac con Apple Silicon (M1 o posterior, macOS 14 o superior)",
      "Todo se ejecuta en tu propio ordenador; tus fotos nunca se suben",
    ],
    cta: "Comprar Nano FaceStudio Pro",
    more: "Ver las novedades de la 1.2",
  },
  vPro: {
    badge: "Nueva app",
    title: "Nano FaceStudio V Pro: cambio de cara en vídeo con tu propia GPU",
    body:
      "Nuestra nueva app de escritorio cambia la cara de una persona en un vídeo usando tu propia GPU NVIDIA, sin créditos y sin cola. Calidad Fast o Best, con salida en 1080p o 4K.",
    bullets: [
      "Elige a la persona, añade una foto de la nueva cara y todo lo demás queda tal como se grabó",
      "Modo solo mejora, sincronización labial opcional y una cola por lotes de hasta 50 vídeos",
      "Se conserva el sonido original; exportación en MP4",
      "Windows con una GPU NVIDIA RTX (8 GB de memoria de vídeo o más)",
    ],
    cta: "Comprar Nano FaceStudio V Pro",
    more: "Ver lo que hace",
    noTrial: "Esta app no tiene prueba gratuita. Puedes probar antes el cambio de cara en vídeo desde el navegador.",
  },
  credits: {
    badge: "Créditos",
    title: "Hasta un 30% de descuento en paquetes de créditos",
    body: "Los créditos sirven para las herramientas online: cambio de cara en vídeo, cambio de cabeza, Face Studio y edición de imágenes. Cuanto más grande el paquete, mayor el descuento, y cada paquete mantiene todos sus créditos.",
    thPack: "Paquete",
    thPrice: "Precio Black Friday",
    thCredits: "Créditos que recibes",
    starterNote: "El paquete Starter de $5 mantiene su precio habitual.",
    autoNote: "Las recargas automáticas hechas durante la oferta también se cobran al precio de oferta. Los créditos nunca caducan.",
    cta: "Comprar créditos",
  },
  neo: {
    badge: "Oferta de lanzamiento de Neo, ampliada",
    title: "Los vídeos Neo cuestan un 30% menos de créditos",
    body:
      "Neo es nuestro nuevo modelo de vídeo: redibuja la cara fotograma a fotograma, para que el resultado se parezca a tu foto. Hasta el 4 de diciembre, cada vídeo Neo cuesta un 30% menos de créditos, y se suma al descuento de los paquetes de créditos.",
    cta: "Probar Neo",
  },
  photoSwap: {
    badge: "Solo para miembros",
    title: "Cambio de cara en fotos a mitad de precio",
    body:
      "Si tu cuenta ya ha comprado créditos (cualquier paquete), cambiar una cara en una foto con Face Studio Online cuesta {member} créditos por cara en lugar de {regular}. Las cuentas que no han comprado créditos pagan el precio normal de {regular}. El cambio de cabeza mantiene su precio.",
    cta: "Abrir Face Studio",
  },
  apps: {
    badge: "Apps de escritorio",
    title: "30% de descuento en nuestras demás apps de escritorio",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh y Nano VideoGen: licencias de pago único, sin suscripción.",
    trialNote: "Todas siguen incluyendo su prueba gratuita de 7 días.",
    cta: "Ver todas las apps de escritorio",
  },
  finePrintHeading: "La letra pequeña",
  finePrint: [
    "Los precios están en dólares estadounidenses.",
    "Los precios de oferta se aplican a las compras hechas durante la oferta. Las compras anteriores no cambian de precio.",
    "Las licencias de escritorio son pagos únicos, sin suscripción. Los créditos nunca caducan.",
    "Nano FaceStudio V Pro es una app nueva. $84.90 es su precio de lanzamiento, no un descuento sobre un precio anterior.",
  ],
  takeover: {
    kicker: "Un mes · 23 nov – 24 dic",
    line1: "Black",
    line2: "Friday",
    sub: "Un mes entero de ofertas en nuestros estudios de escritorio y en los créditos online. Sin códigos ni trampas: el precio que ves al pagar es el precio que pagas.",
    upTo: "Hasta un",
    off: "menos en créditos",
    startsIn: "Empieza en",
    endsIn: "Termina en",
    days: "días",
    hours: "horas",
    minutes: "min",
    seconds: "s",
    cta: "Ver todas las ofertas",
    ctaCredits: "Comprar créditos",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "Cambio de cara por lotes, ahora en Mac" },
      vPro: { title: "FaceStudio V Pro", line: "Cambio de cara en vídeo con tu propia GPU", tag: "Nueva app" },
      credits: { title: "Paquetes de créditos", line: "Más grande el paquete, mayor el descuento" },
      apps: { title: "Apps de escritorio", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday: un mes entero de ofertas",
    body: "FaceStudio Pro 1.2 con cambio por lotes y Mac, el nuevo FaceStudio V Pro, hasta un 30% menos en créditos y un 30% menos en las demás apps.",
    cta: "Ver las ofertas",
  },
};

const ptBR: BlackFridayCopy = {
  pageTitle: "Black Friday na NanoPocket: ofertas até 24 de dezembro",
  pageDescription:
    "Um mês de ofertas de Black Friday: Nano FaceStudio Pro 1.2 com troca em lote e versão para Mac, o lançamento do Nano FaceStudio V Pro, até 30% de desconto em pacotes de créditos e 30% de desconto nos outros apps para desktop.",
  kicker: "Black Friday · um mês",
  heading: "A Black Friday dura um mês inteiro",
  intro:
    "De 23 de novembro a 24 de dezembro (horário do Pacífico), cada oferta abaixo vale automaticamente, sem código para digitar. O preço que você vê no checkout é o preço que você paga.",
  upcoming: "As ofertas começam em {date}. Até lá, valem os preços normais.",
  running: "Acontecendo agora, até {date} · {left}",
  ended: "A Black Friday terminou. Obrigado a todos que participaram.",
  offersHeading: "As ofertas deste mês",
  studioPro: {
    badge: "Nova versão",
    title: "Nano FaceStudio Pro 1.2: troca de rosto em lote, agora no Mac",
    body:
      "Nosso estúdio de rostos para desktop agora troca um ensaio inteiro de uma vez: adicione as fotos, escolha uma referência e clique em Iniciar. A versão 1.2 também roda nativamente em Macs com Apple Silicon.",
    bullets: [
      "Troca em lote: uma referência para quantas fotos você quiser, enquanto você continua editando",
      "Fotos em grupo: escolha uma pessoa, várias ou todas",
      "Novo app nativo para Mac com Apple Silicon (M1 ou mais recente, macOS 14+)",
      "Tudo roda no seu próprio computador; suas fotos nunca são enviadas",
    ],
    cta: "Comprar Nano FaceStudio Pro",
    more: "Veja as novidades da 1.2",
  },
  vPro: {
    badge: "Novo app",
    title: "Nano FaceStudio V Pro: troca de rosto em vídeo na sua própria GPU",
    body:
      "Nosso novo app para desktop troca o rosto de uma pessoa em um vídeo usando a sua própria GPU NVIDIA, sem créditos e sem fila. Qualidade Fast ou Best, com saída em 1080p ou 4K.",
    bullets: [
      "Escolha a pessoa, adicione uma foto do novo rosto e mantenha todo o resto como foi filmado",
      "Modo só aprimorar, sincronização labial opcional e fila em lote de até 50 vídeos",
      "Som original mantido; exportação em MP4",
      "Windows com GPU NVIDIA RTX (8 GB de memória de vídeo ou mais)",
    ],
    cta: "Comprar Nano FaceStudio V Pro",
    more: "Veja o que ele faz",
    noTrial: "Este app não tem teste grátis. Você pode experimentar a troca de rosto em vídeo no navegador primeiro.",
  },
  credits: {
    badge: "Créditos",
    title: "Até 30% de desconto em pacotes de créditos",
    body: "Os créditos pagam as ferramentas online: troca de rosto em vídeo, troca de cabeça, Face Studio e edição de imagem. Quanto maior o pacote, maior o desconto, e cada pacote mantém todos os seus créditos.",
    thPack: "Pacote",
    thPrice: "Preço de Black Friday",
    thCredits: "Créditos que você recebe",
    starterNote: "O pacote Starter de $5 mantém o preço normal.",
    autoNote: "Recargas automáticas feitas durante a promoção também são cobradas pelo preço promocional. Os créditos nunca expiram.",
    cta: "Comprar créditos",
  },
  neo: {
    badge: "Oferta de lançamento do Neo, prorrogada",
    title: "Vídeos Neo custam 30% menos créditos",
    body:
      "Neo é nosso novo modelo de vídeo: ele redesenha o rosto quadro a quadro, para que o resultado fique parecido com a sua foto. Até 4 de dezembro, cada vídeo Neo custa 30% menos créditos, e isso se soma ao desconto do pacote de créditos.",
    cta: "Experimentar o Neo",
  },
  photoSwap: {
    badge: "Só para membros",
    title: "Troca de rosto em fotos pela metade do preço",
    body:
      "Se a sua conta já comprou créditos (qualquer pacote), trocar um rosto em uma foto no Face Studio Online custa {member} créditos por rosto em vez de {regular}. Contas que não compraram créditos pagam o preço normal de {regular}. A troca de cabeça mantém o preço.",
    cta: "Abrir o Face Studio",
  },
  apps: {
    badge: "Apps para desktop",
    title: "30% de desconto nos nossos outros apps para desktop",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh e Nano VideoGen: licenças de pagamento único, sem assinatura.",
    trialNote: "Todos continuam com o teste grátis de 7 dias.",
    cta: "Ver todos os apps para desktop",
  },
  finePrintHeading: "Letras miúdas",
  finePrint: [
    "Os preços estão em dólares americanos.",
    "Os preços promocionais valem para compras feitas durante a promoção. Compras anteriores não têm o preço recalculado.",
    "As licenças para desktop são pagamentos únicos, sem assinatura. Os créditos nunca expiram.",
    "O Nano FaceStudio V Pro é um app novo. $84.90 é o preço de lançamento, não um desconto sobre um preço anterior.",
  ],
  takeover: {
    kicker: "Um mês · 23 nov – 24 dez",
    line1: "Black",
    line2: "Friday",
    sub: "Um mês inteiro de ofertas nos nossos estúdios para desktop e nos créditos online. Sem códigos, sem pegadinhas: o preço no checkout é o preço que você paga.",
    upTo: "Até",
    off: "de desconto em créditos",
    startsIn: "Começa em",
    endsIn: "Termina em",
    days: "dias",
    hours: "horas",
    minutes: "min",
    seconds: "seg",
    cta: "Ver todas as ofertas",
    ctaCredits: "Comprar créditos",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "Troca de rosto em lote, agora no Mac" },
      vPro: { title: "FaceStudio V Pro", line: "Troca de rosto em vídeo na sua própria GPU", tag: "Novo app" },
      credits: { title: "Pacotes de créditos", line: "Quanto maior o pacote, maior o desconto" },
      apps: { title: "Apps para desktop", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday: um mês inteiro de ofertas",
    body: "FaceStudio Pro 1.2 com troca em lote e Mac, o novo FaceStudio V Pro, até 30% de desconto em créditos e 30% nos outros apps.",
    cta: "Ver as ofertas",
  },
};

const de: BlackFridayCopy = {
  pageTitle: "Black Friday bei NanoPocket: Angebote bis 24. Dezember",
  pageDescription:
    "Ein Monat Black-Friday-Angebote: Nano FaceStudio Pro 1.2 mit Stapeltausch und Mac-Version, der Start von Nano FaceStudio V Pro, bis zu 30% Rabatt auf Credit-Pakete und 30% Rabatt auf die anderen Desktop-Apps.",
  kicker: "Black Friday · einen Monat lang",
  heading: "Black Friday dauert einen ganzen Monat",
  intro:
    "Vom 23. November bis 24. Dezember (pazifische Zeit) gilt jedes Angebot unten von selbst, ohne dass du einen Code eingeben musst. Der Preis, den du an der Kasse siehst, ist der Preis, den du zahlst.",
  upcoming: "Die Angebote starten am {date}. Bis dahin gelten die regulären Preise.",
  running: "Läuft jetzt, bis {date} · {left}",
  ended: "Black Friday ist vorbei. Danke an alle, die mitgemacht haben.",
  offersHeading: "Die Angebote dieses Monats",
  studioPro: {
    badge: "Neue Version",
    title: "Nano FaceStudio Pro 1.2: Gesichtertausch im Stapel, jetzt auch für Mac",
    body:
      "Unser Desktop-Gesichtsstudio tauscht jetzt ein ganzes Shooting in einem Durchgang: Fotos hinzufügen, eine Referenz wählen, auf Start klicken. Version 1.2 läuft außerdem nativ auf Macs mit Apple Silicon.",
    bullets: [
      "Stapeltausch: eine Referenz für beliebig viele Fotos, während du weiter bearbeitest",
      "Gruppenfotos: eine Person, mehrere oder alle auswählen",
      "Neue native Mac-App für Apple Silicon (M1 oder neuer, macOS 14+)",
      "Alles läuft auf deinem eigenen Computer; deine Fotos werden nie hochgeladen",
    ],
    cta: "Nano FaceStudio Pro kaufen",
    more: "Neues in 1.2 ansehen",
  },
  vPro: {
    badge: "Neue App",
    title: "Nano FaceStudio V Pro: Video-Face-Swap auf deiner eigenen GPU",
    body:
      "Unsere neue Desktop-App tauscht das Gesicht einer Person im Video auf deiner eigenen NVIDIA-GPU, ohne Credits und ohne Warteschlange. Qualität Fast oder Best, Ausgabe in 1080p oder 4K.",
    bullets: [
      "Person auswählen, ein Foto des neuen Gesichts hinzufügen, alles andere bleibt wie gefilmt",
      "Nur-Verbessern-Modus, optionale Lippensynchronisation und eine Stapel-Warteschlange mit bis zu 50 Videos",
      "Originalton bleibt erhalten; Export als MP4",
      "Windows mit einer NVIDIA RTX GPU (8 GB Grafikspeicher oder mehr)",
    ],
    cta: "Nano FaceStudio V Pro kaufen",
    more: "Ansehen, was die App kann",
    noTrial: "Für diese App gibt es keine kostenlose Testversion. Du kannst Video-Face-Swap vorher im Browser ausprobieren.",
  },
  credits: {
    badge: "Credits",
    title: "Bis zu 30% Rabatt auf Credit-Pakete",
    body: "Mit Credits bezahlst du die Online-Tools: Video-Face-Swap, Kopftausch, Face Studio und Bildbearbeitung. Je größer das Paket, desto größer der Rabatt, und jedes Paket behält alle seine Credits.",
    thPack: "Paket",
    thPrice: "Black-Friday-Preis",
    thCredits: "Credits, die du erhältst",
    starterNote: "Das Starter-Paket für $5 behält seinen regulären Preis.",
    autoNote: "Automatische Aufladungen während der Aktion werden ebenfalls zum Aktionspreis berechnet. Credits verfallen nie.",
    cta: "Credits kaufen",
  },
  neo: {
    badge: "Neo-Startangebot verlängert",
    title: "Neo-Videos kosten 30% weniger Credits",
    body:
      "Neo ist unser neues Videomodell: Es zeichnet das Gesicht Bild für Bild neu, damit das Ergebnis aussieht wie auf deinem Foto. Bis zum 4. Dezember kostet jedes Neo-Video 30% weniger Credits, zusätzlich zum Rabatt auf Credit-Pakete.",
    cta: "Neo ausprobieren",
  },
  photoSwap: {
    badge: "Nur für Mitglieder",
    title: "Foto-Face-Swaps zum halben Preis",
    body:
      "Hat dein Konto schon Credits gekauft (egal welches Paket), kostet ein Foto-Face-Swap in Face Studio Online {member} statt {regular} Credits pro Gesicht. Konten ohne Kauf zahlen weiter den normalen Preis von {regular}. Head-Swaps behalten ihren Preis.",
    cta: "Face Studio öffnen",
  },
  apps: {
    badge: "Desktop-Apps",
    title: "30% Rabatt auf unsere anderen Desktop-Apps",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh und Nano VideoGen: Einmal-Lizenzen, kein Abo.",
    trialNote: "Jede App hat weiterhin ihre 7-tägige kostenlose Testphase.",
    cta: "Alle Desktop-Apps ansehen",
  },
  finePrintHeading: "Das Kleingedruckte",
  finePrint: [
    "Preise in US-Dollar.",
    "Aktionspreise gelten für Käufe während der Aktion. Frühere Käufe werden nicht nachträglich angepasst.",
    "Desktop-Lizenzen sind Einmalzahlungen, ohne Abo. Credits verfallen nie.",
    "Nano FaceStudio V Pro ist eine neue App. $84.90 ist ihr Einführungspreis, kein Rabatt auf einen früheren Preis.",
  ],
  takeover: {
    kicker: "Einen Monat lang · 23. Nov. – 24. Dez.",
    line1: "Black",
    line2: "Friday",
    sub: "Ein ganzer Monat voller Angebote für unsere Desktop-Studios und Online-Credits. Keine Codes, kein Haken: Der Preis an der Kasse ist der Preis, den du zahlst.",
    upTo: "Bis zu",
    off: "Rabatt auf Credits",
    startsIn: "Startet in",
    endsIn: "Endet in",
    days: "Tage",
    hours: "Std.",
    minutes: "Min.",
    seconds: "Sek.",
    cta: "Alle Angebote ansehen",
    ctaCredits: "Credits kaufen",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "Gesichtertausch im Stapel, jetzt auch für Mac" },
      vPro: { title: "FaceStudio V Pro", line: "Video-Face-Swap auf deiner eigenen GPU", tag: "Neue App" },
      credits: { title: "Credit-Pakete", line: "Je größer das Paket, desto größer der Rabatt" },
      apps: { title: "Desktop-Apps", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday: ein ganzer Monat voller Angebote",
    body: "FaceStudio Pro 1.2 mit Stapeltausch und Mac, das neue FaceStudio V Pro, bis zu 30% Rabatt auf Credits, 30% auf die anderen Apps.",
    cta: "Angebote ansehen",
  },
};

const fr: BlackFridayCopy = {
  pageTitle: "Black Friday chez NanoPocket : offres jusqu'au 24 décembre",
  pageDescription:
    "Un mois d'offres Black Friday : Nano FaceStudio Pro 1.2 avec échange par lot et version Mac, le lancement de Nano FaceStudio V Pro, jusqu'à 30% de remise sur les packs de crédits et 30% de remise sur les autres applications de bureau.",
  kicker: "Black Friday · un mois",
  heading: "Le Black Friday dure un mois entier",
  intro:
    "Du 23 novembre au 24 décembre (heure du Pacifique), chaque offre ci-dessous s'applique automatiquement, sans code à saisir. Le prix affiché au paiement est le prix que vous payez.",
  upcoming: "Les offres commencent le {date}. D'ici là, les prix habituels s'appliquent.",
  running: "En cours, jusqu'au {date} · {left}",
  ended: "Le Black Friday est terminé. Merci à toutes celles et ceux qui y ont participé.",
  offersHeading: "Les offres du mois",
  studioPro: {
    badge: "Nouvelle version",
    title: "Nano FaceStudio Pro 1.2 : échange de visage par lot, désormais sur Mac",
    body:
      "Notre studio de visages pour ordinateur échange désormais toute une séance photo en une seule fois : ajoutez les photos, choisissez une référence, cliquez sur Démarrer. La version 1.2 fonctionne aussi nativement sur les Mac Apple Silicon.",
    bullets: [
      "Échange par lot : une référence pour autant de photos que vous voulez, pendant que vous continuez à retoucher",
      "Photos de groupe : choisissez une personne, plusieurs ou tout le monde",
      "Nouvelle application Mac native pour Apple Silicon (M1 ou plus récent, macOS 14+)",
      "Tout fonctionne sur votre propre ordinateur ; vos photos ne sont jamais envoyées en ligne",
    ],
    cta: "Acheter Nano FaceStudio Pro",
    more: "Voir les nouveautés de la 1.2",
  },
  vPro: {
    badge: "Nouvelle application",
    title: "Nano FaceStudio V Pro : face swap vidéo sur votre propre GPU",
    body:
      "Notre nouvelle application de bureau remplace le visage d'une personne dans une vidéo sur votre propre GPU NVIDIA, sans crédits et sans file d'attente. Qualité Fast ou Best, sortie en 1080p ou 4K.",
    bullets: [
      "Choisissez la personne, ajoutez une photo du nouveau visage : tout le reste est conservé tel que filmé",
      "Mode amélioration seule, synchronisation labiale en option et file de traitement par lot jusqu'à 50 vidéos",
      "Son d'origine conservé ; export en MP4",
      "Windows avec un GPU NVIDIA RTX (8 Go de mémoire vidéo ou plus)",
    ],
    cta: "Acheter Nano FaceStudio V Pro",
    more: "Découvrir ce qu'elle fait",
    noTrial: "Pas d'essai gratuit pour cette application. Vous pouvez d'abord essayer le face swap vidéo dans le navigateur.",
  },
  credits: {
    badge: "Crédits",
    title: "Jusqu'à 30% de remise sur les packs de crédits",
    body: "Les crédits servent à payer les outils en ligne : face swap vidéo, échange de tête, Face Studio et retouche d'image. Plus le pack est grand, plus la remise est importante, et chaque pack conserve tous ses crédits.",
    thPack: "Pack",
    thPrice: "Prix Black Friday",
    thCredits: "Crédits obtenus",
    starterNote: "Le pack Starter à $5 garde son prix habituel.",
    autoNote: "Les recharges automatiques effectuées pendant la promotion sont aussi facturées au prix promotionnel. Les crédits n'expirent jamais.",
    cta: "Acheter des crédits",
  },
  neo: {
    badge: "Offre de lancement Neo prolongée",
    title: "Les vidéos Neo coûtent 30% de crédits en moins",
    body:
      "Neo est notre nouveau modèle vidéo : il redessine le visage image par image, pour un résultat qui ressemble à votre photo. Jusqu’au 4 décembre, chaque vidéo Neo coûte 30% de crédits en moins, en plus de la remise sur les packs de crédits.",
    cta: "Essayer Neo",
  },
  photoSwap: {
    badge: "Réservé aux membres",
    title: "Échange de visage sur photo à moitié prix",
    body:
      "Si votre compte a déjà acheté des crédits (n’importe quel pack), un échange de visage sur photo dans Face Studio Online coûte {member} crédits par visage au lieu de {regular}. Les comptes qui n’ont pas acheté de crédits paient le prix normal de {regular}. L’échange de tête garde son prix.",
    cta: "Ouvrir Face Studio",
  },
  apps: {
    badge: "Applications de bureau",
    title: "30% de remise sur nos autres applications de bureau",
    body: "Nano ImageEdit, Nano VideoEnhance, Nano ImageEnh et Nano VideoGen : licences à paiement unique, sans abonnement.",
    trialNote: "Chacune conserve son essai gratuit de 7 jours.",
    cta: "Voir toutes les applications de bureau",
  },
  finePrintHeading: "Les conditions",
  finePrint: [
    "Les prix sont en dollars américains.",
    "Les prix promotionnels s'appliquent aux achats effectués pendant la promotion. Les achats antérieurs ne sont pas réajustés.",
    "Les licences de bureau sont des paiements uniques, sans abonnement. Les crédits n'expirent jamais.",
    "Nano FaceStudio V Pro est une nouvelle application. $84.90 est son prix de lancement, et non une remise sur un prix antérieur.",
  ],
  takeover: {
    kicker: "Un mois · 23 nov. – 24 déc.",
    line1: "Black",
    line2: "Friday",
    sub: "Un mois entier d'offres sur nos studios de bureau et nos crédits en ligne. Sans code, sans piège : le prix affiché au paiement est le prix que vous payez.",
    upTo: "Jusqu'à",
    off: "de remise sur les crédits",
    startsIn: "Début dans",
    endsIn: "Fin dans",
    days: "jours",
    hours: "heures",
    minutes: "min",
    seconds: "s",
    cta: "Voir toutes les offres",
    ctaCredits: "Acheter des crédits",
    tiles: {
      studioPro: { title: "FaceStudio Pro 1.2", line: "Échange de visage par lot, désormais sur Mac" },
      vPro: { title: "FaceStudio V Pro", line: "Face swap vidéo sur votre propre GPU", tag: "Nouvelle application" },
      credits: { title: "Packs de crédits", line: "Plus le pack est grand, plus la remise l'est aussi" },
      apps: { title: "Applications de bureau", line: "ImageEdit, VideoEnhance, ImageEnh, VideoGen" },
    },
  },
  banner: {
    title: "Black Friday : un mois entier d'offres",
    body: "FaceStudio Pro 1.2 avec échange par lot et Mac, le nouveau FaceStudio V Pro, jusqu'à 30% de remise sur les crédits, 30% sur les autres applications.",
    cta: "Voir les offres",
  },
};

export const BLACK_FRIDAY_COPY: Partial<Record<AppLocale | "en", BlackFridayCopy>> = {
  en,
  "zh-CN": zhCN,
  ja,
  ko,
  es,
  "pt-BR": ptBR,
  de,
  fr,
};

export function blackFridayCopy(locale: string): BlackFridayCopy {
  return BLACK_FRIDAY_COPY[locale as AppLocale] ?? en;
}
