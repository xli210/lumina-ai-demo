# Backlink and listing copy (not posted anywhere)

Written 2026-10-20 from Search Console data (28 days to 2026-10-17: 364 clicks, 2.3K
impressions, brand queries at position 1, Chinese "AI换脸" queries at 20-50, almost no
English non-brand impressions). Nothing here has been posted on anyone's behalf: each item
needs the owner's own account and a decision to publish.

Rules for every listing: link to `https://nanopocket.ai/facestudio-v` or `/face-swap`, say that
Video FaceSwap Online is paid in credits (price shown before each video, failed videos
refunded) and that videos from accounts that never topped up carry a moving watermark. Do not
call the older Mixkit demo footage licensed.

## Where to list (free, relevant, each gives a followed or branded link)

| Site | What to submit | Link target |
|---|---|---|
| Product Hunt | Video FaceSwap Online 1.1.0 launch | /facestudio-v |
| AlternativeTo | Entry for NanoPocket as an alternative to Reface / DeepSwap | /face-swap |
| There's An AI For That | Video FaceSwap Online | /facestudio-v |
| Hugging Face | A Space or model-card link on the existing Nano_faceswap repo | /face-swap |
| GitHub | Link in the public repo xli210/lumina-ai-demo README | / |
| Reddit | r/StableDiffusion, r/SideProject (read each sub's self-promotion rule first) | /facestudio-v |

## One-line description (<= 90 characters)

Swap a face in a video and keep everything else as filmed. Paid in credits, no install.

## Short description (about 300 characters)

Video FaceSwap Online replaces one person's face, or the whole head, in a video with a
reference photo, and leaves everyone else and the sound as filmed. Version 1.1.0 adds
five new hard-footage examples: full profile turns, hands and arms in front of the face,
side views in low light, and handheld, tilting heads.

## Post for a community (edit to taste)

Title: Video face swap that keeps hands and arms in front of the face (1.1.0)

Body: We released version 1.1.0 of Video FaceSwap Online. The new examples are the shots
where swaps usually slip: a head turning ninety degrees, a hand over the face, an arm
sweeping across it. Before/after clips with the reference photo are on the page. It is
paid in credits (the price is shown before you start, failed videos are refunded), and
videos from accounts that never topped up carry a moving watermark. Feedback on the hard
cases is very welcome: https://nanopocket.ai/facestudio-v

## Chinese version (for Chinese forums and directories)

Video FaceSwap Online 1.1.0:AI 视频换脸,只替换你选的那个人,其他人和原声保持不变。
新增侧脸转头、手和手臂挡脸、低光侧面、手持晃动等困难镜头的前后对比。按积分计费,
开始前显示价格,失败自动退款;从未充值的账号生成的视频会带移动水印。
https://nanopocket.ai/facestudio-v

## Nano ImageEdit 2.0 Online (added 2026-10-20)

What can be said, and what cannot yet:

- Can say: for Remove, Replace, Add, Text and Magic Edit, every pixel outside the edited area
  is kept identical and the editor reports the share of the image that changed (lib/image-edit-facts.ts).
  It runs in the browser on NanoPocket's GPUs, paid per edit in credits, no subscription.
- Cannot say yet: that it beats Nano Banana, Flux or any named model (no side-by-side data in
  the repo), or that the desktop Nano ImageEdit keeps pixels identical (it does not; it is a local
  Flux.1 generator). A claim against a named model needs a reproducible test first: same photos and
  prompts through both, then the share of pixels changed outside the edit.

One-line: Edit a photo by describing the change, and every pixel outside the edit stays identical.

Post: Most AI photo editors regenerate the whole picture. Ours keeps everything outside the edit
identical for object edits (remove, replace, add, change text) and shows how much of the image
changed, so you can check it yourself. Browser-based, paid per edit, no subscription:
https://nanopocket.ai/image-edit

## 2026-10-30 update: lead with "free to start", list all four online tools

Still nothing posted on anyone's behalf: every listing below needs the owner's own account.
Each claim here is true on 2026-10-30 and comes from the billing constants (lib/credits.ts,
lib/facestudio.ts): 100 free credits on sign-up (10 photo face swaps), free top-ups to 30
credits at most three times a month, no card, no subscription. Results from accounts that
have never bought credits carry a watermark; photo edits never do. Never write "unlimited",
"no watermark" (for swaps) or "free forever" for the online tools.

### Owner checklist, in order of value

1. Bing Webmaster Tools: sign in at https://www.bing.com/webmasters, choose "Import from
   Google Search Console" (one click, verifies the site and imports the sitemaps). ChatGPT
   search, Copilot and DuckDuckGo read Bing's index. `public/BingSiteAuth.xml` is already live
   if you prefer file verification.
2. Product Hunt launch of Video FaceSwap Online (Tuesday to Thursday, 00:01 PT).
3. AlternativeTo: add NanoPocket as an alternative to Reface, DeepSwap, FaceFusion, Akool.
4. AI directories (check each one's current price before paying): There's An AI For That,
   Futurepedia, Toolify, TopAI.tools, FutureTools, SaaSHub, AI Valley.
5. Chinese: V2EX 「分享创造」, 少数派 Matrix, 知乎回答 ("有哪些好用的 AI 换脸工具"), 小红书 and
   Bilibili with a before/after clip from /video-face-swap-examples, 即刻.
6. Reddit r/SideProject and r/StableDiffusion (read each sub's self-promotion rule first),
   Hacker News "Show HN" for the hard-footage test results page.

### Listing fields (paste as is)

- Name: NanoPocket
- Tagline (<= 60): AI face swap for photos and video, free to start
- Category: AI image editing / AI video / face swap
- Pricing model: Freemium (free credits on sign-up, then pay per use; no subscription)
- Website: https://nanopocket.ai/face-swap
- Main link for video: https://nanopocket.ai/facestudio-v
- Examples: https://nanopocket.ai/video-face-swap-examples
- Images: https://nanopocket.ai/images/facestudio-v/og-facestudio-v.jpg,
  https://nanopocket.ai/images/face-studio/group-after.jpg

Short description (<= 160):
Swap a face or a whole head in a video or a group photo, in your browser. 100 free credits on
sign-up, no card, no install, no subscription.

Long description:
NanoPocket makes AI face swap tools that run in the browser. Video FaceSwap Online replaces
one person's face, or their whole head, in a video and keeps everyone else and the sound as
filmed; it is built for hard footage such as profile turns and hands over the face. Nano
FaceStudio Online swaps up to six faces in one photo and keeps the hair, hands and glasses that
cross a face. Nano HeadSwap Pro puts a whole new head into a photo, and Nano ImageEdit 2.0
Online edits a photo by describing the change. New accounts get 100 free credits (10 photo face
swaps), with free top-ups after that; then every tool is paid per use in credits that never
expire. Swaps from accounts that have never bought credits carry a watermark.

### Chinese listing (中文)

- 一句话:在线 AI 换脸,照片、合影、视频都能换,注册送免费积分。
- 简介:NanoPocket 是在浏览器里用的 AI 换脸工具。Video FaceSwap Online 只替换视频里你选的那个人
  (脸或整个头),其他人和原声保持不变,侧脸转头、手挡脸也能换;Nano FaceStudio Online 一张合影最多
  同时换 6 张脸;Nano HeadSwap Pro 换整个头;Nano ImageEdit 2.0 Online 用文字描述来修图。注册即送
  100 积分(约 10 次照片换脸),无需信用卡、无需安装、无需订阅;之后按积分付费,积分永不过期。从未
  充值的账号换脸结果带水印,充值一次即去除。
- 链接:https://nanopocket.ai/zh-CN
