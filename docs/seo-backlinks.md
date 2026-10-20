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
