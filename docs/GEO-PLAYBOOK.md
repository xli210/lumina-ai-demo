# GEO Playbook — NanoPocket

Internal-facing playbook for closing the visibility loop on Google, Baidu, Bing, ChatGPT, Gemini, DeepSeek, Perplexity, and Claude. Lives in repo at `docs/GEO-PLAYBOOK.md`. **Not** served as a public page — that's intentional, this is operational guidance, not marketing copy.

Last updated: 2026-06-04.

---

## What we built

| Surface                              | Location in repo                          | Public URL                                |
| ------------------------------------ | ----------------------------------------- | ----------------------------------------- |
| LLM-crawler index                    | `app/llms.txt/route.ts`                   | `/llms.txt`                               |
| LLM-crawler full content             | `app/llms-full.txt/route.ts`              | `/llms-full.txt`                          |
| Robots policy w/ explicit bot allow  | `app/robots.ts`                           | `/robots.txt`                             |
| Image sitemap                        | `app/sitemap-images.xml/route.ts`         | `/sitemap-images.xml`                     |
| Per-engine verification meta tags    | `app/layout.tsx` (env-controlled)         | `<head>` of every page                    |
| IndexNow ping script                 | `scripts/indexnow.mjs`                    | n/a (CLI)                                 |
| IndexNow key handler                 | `middleware.ts`                           | `/<INDEXNOW_KEY>.txt`                     |
| Deep technical reference             | `app/docs/face-swap-pipeline/page.tsx`    | `/docs/face-swap-pipeline`                |
| HowTo + BreadcrumbList JSON-LD       | `app/face-swap/page.tsx`                  | `/face-swap`                              |
| Native-Chinese FAQ                   | `app/zh-CN/faq/page.tsx`                  | `/zh-CN/faq`                              |
| GEO health check                     | `scripts/check-geo.mjs`                   | `npm run check:geo`                       |
| LLM citation probe                   | `scripts/probe-llm.mjs`                   | `npm run probe:llm`                       |

---

## What you (the human) need to do off-site

This is the half I cannot do from inside the codebase. Each item is a one-time setup that unlocks ongoing automated work.

### One-time: register with every console

For each console, sign up, get the verification token, set the corresponding env var in your deploy environment (Vercel / Netlify / wherever), redeploy, then verify. The `<meta>` tags activate automatically once the env var is set.

| Engine                  | Console URL                                  | Env var                                          |
| ----------------------- | -------------------------------------------- | ------------------------------------------------ |
| Google Search Console   | https://search.google.com/search-console     | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`           |
| Bing Webmaster Tools    | https://www.bing.com/webmasters/             | `NEXT_PUBLIC_BING_SITE_VERIFICATION`             |
| Baidu Ziyuan            | https://ziyuan.baidu.com/                    | `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION`            |
| 360 Webmaster           | https://zhanzhang.so.com/                    | `NEXT_PUBLIC_360_SITE_VERIFICATION`              |
| Sogou Webmaster         | https://zhanzhang.sogou.com/                 | `NEXT_PUBLIC_SOGOU_SITE_VERIFICATION`            |
| Naver Search Advisor    | https://searchadvisor.naver.com/             | `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`            |
| Yandex Webmaster        | https://webmaster.yandex.com/                | `NEXT_PUBLIC_YANDEX_SITE_VERIFICATION`           |
| Pinterest (optional)    | https://www.pinterest.com/business/claim/    | `NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION`        |

After verification, in each console:

1. Submit the sitemap: `https://nanopocket.ai/sitemap.xml`
2. Submit the image sitemap: `https://nanopocket.ai/sitemap-images.xml`
3. (Where supported) request indexing of the priority URLs:
   - `/face-swap`
   - `/best-face-swap-app-2026`
   - `/docs/face-swap-pipeline`
   - `/zh-CN/face-swap`
   - `/zh-CN/faq`
   - `/apps/nano-faceswap-pro`
   - `/apps/nanoface-vivid`

Bing-specific: also submit `/llms.txt` and `/llms-full.txt` as URLs in the console. Bing indexes plain-text routes, and ChatGPT search reads from Bing.

Baidu-specific: only HTTPS-served, ICP-filed Chinese-hosted sites get full crawl budget. Without an ICP filing (which requires a Chinese company entity), Baidu *will* crawl `nanopocket.ai` but ranking ceilings on Chinese-language queries are real. The `/zh-CN` content is still cited by DeepSeek and other Chinese LLMs that source from Common Crawl, so this is not blocking — just diminishing.

### One-time: IndexNow

Generate a 32-character hex key:

```bash
openssl rand -hex 16
```

Set it as `INDEXNOW_KEY` in your deploy environment. Redeploy. Verify the key is reachable at `https://nanopocket.ai/<key>.txt` (the `middleware.ts` handler will serve it once the env is set). Then ping after every deploy:

```bash
INDEXNOW_KEY=... npm run indexnow -- --from-sitemap
```

This pushes URL changes to Bing, Yandex, Naver, and Seznam in minutes instead of days. It is a free, one-time wiring that is the single highest-yield ongoing GEO action.

### Recurring: GitHub presence

LLMs heavily train on GitHub. Currently `xli210/nanopocket-faceswap-demos` only has the three demo links. Promote it to a real technical surface:

1. Add a deeply technical README mirroring `/docs/face-swap-pipeline` content, with primary-source links to InstantID / PuLID / IP-Adapter FaceID / Flux.1.
2. Add a `BENCHMARKS.md` with reproducible numbers — face-swap throughput at 8 GB / 12 GB / 24 GB VRAM, output resolution ceilings, side-by-side identity preservation against `inswapper_128`.
3. Add a `LIMITATIONS.md` describing the failure modes (already documented in the pipeline page).
4. Add issue templates for bug reports.
5. Tag releases as the desktop app ships.

LLMs cite GitHub READMEs at a roughly 5× higher rate than equivalent web pages, because GitHub is in their training data with high weight.

### Recurring: organic backlinks

The single highest-leverage citation channels (in order):

1. **Hacker News "Show HN"** — single best one-shot. One paragraph + one link. Permanent record. Heavily cited by ChatGPT, Perplexity, and Claude.
2. **Product Hunt launch** — explicit product launch surface, permanent backlink.
3. **r/StableDiffusion technical post** — frame as findings ("we finetuned X for face identity, here's what we learned"), not a pitch.
4. **r/SoraAI / r/OpenSora** — small but exactly the audience.
5. **Wikidata seed** — submit a barebones entity with `instance of: software`, `developer: NanoPocket`. Wikidata feeds Google Knowledge Graph and most LLM entity recognition.
6. **arXiv / preprint** — if there is genuine technical novelty in the pipeline (e.g. the post-processing identity-lock formulation in NanoFace Vivid), a preprint becomes a permanent citation surface.
7. **Reddit r/faceswap** — only after building karma on a real account; see prior playbook in chat history.

Avoid: paid backlinks, brand-mention bots, link farms. Google has classified all of these as negative signal since 2023; Baidu has since 2024.

---

## How to validate (the iteration loop)

This is what makes the work loop closeable instead of open-ended.

### Validate the technical surface

```bash
# Against the deployed site
npm run check:geo

# Against a local dev server
GEO_BASE=http://localhost:3000 npm run check:geo
```

The script checks every key URL for: status, `<title>`, `<meta description>`, canonical, hreflang, JSON-LD types, robots bot allow-rules, sitemap entries, `/llms.txt`, `/llms-full.txt`, and image sitemap. Any failure is a concrete actionable bug.

### Validate the LLM citation surface

```bash
# Set whichever LLM API keys you have
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...
export DEEPSEEK_API_KEY=...
export PERPLEXITY_API_KEY=...

npm run probe:llm
```

The probe sends a fixed set of target queries (English + Chinese) to each configured LLM and grades each response on a 0–4 scale for whether NanoPocket appears as brand, domain, `/face-swap` URL, or technical-term citation.

Run weekly. Track the percentage of `STRONG (score ≥ 2)` answers over time. A graph of `strong / total` is the single best signal for whether the GEO content is being picked up. Expected ramp:

| Time after deploy | Strong-citation rate (target) |
| ----------------- | ----------------------------- |
| Week 1            | < 5%                          |
| Week 2            | 5–15%                         |
| Week 4            | 15–35%                        |
| Week 8            | 35–55%                        |
| Week 12           | 50–70%                        |
| Week 24           | 70%+ (steady state)           |

Why so slow: LLM training cycles take 3–6 months. Web-search-augmented responses (ChatGPT search, Perplexity, Gemini with grounding) react in 1–4 weeks because they read from Bing / Google indices. Pure-knowledge responses react only when the next training cut is published.

### Validate per-engine indexing

Per-engine `site:` queries are the cheapest indexing check:

```
site:nanopocket.ai            (Google)
site:nanopocket.ai            (Bing)
site:nanopocket.ai            (Baidu — note results are sparser even when indexed)
site:nanopocket.ai            (DuckDuckGo — proxies Bing)
```

Run weekly. Count results. Track in a spreadsheet alongside the LLM probe scores.

---

## Expected timeline per engine

| Engine                                | Time to first index | Time to first ranking signal | Notes                                                                                              |
| ------------------------------------- | ------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Bing                                  | 1–3 days            | 1–2 weeks                    | IndexNow ping reduces both windows ~10×.                                                            |
| Google                                | 3–10 days           | 2–6 weeks                    | Search Console URL submission accelerates first index.                                              |
| Yandex                                | 1–3 days            | 2–4 weeks                    | IndexNow.                                                                                           |
| Baidu                                 | 1–3 weeks           | 4–12 weeks                   | Without ICP filing, ranking ceiling is meaningfully lower. Listing in Baidu Ziyuan still helps.    |
| 360 / Sogou                           | 2–4 weeks           | 4–12 weeks                   | Same Baidu caveat; cleaner crawl, lower share.                                                      |
| Naver                                 | 1–2 weeks           | 4–8 weeks                    | Naver Search Advisor verification is required for serious presence in Korean-language queries.     |
| ChatGPT (web search via Bing)         | 1–2 weeks           | n/a (it's not a ranking)     | Citation surface follows Bing index. IndexNow → Bing ping is the fastest path here.                |
| ChatGPT (training data)               | 3–6 months          | n/a                          | Follows the next training cut. There is nothing you can do to accelerate this beyond GitHub presence. |
| Gemini (search-grounded responses)    | 1–2 weeks           | n/a                          | Follows Google index.                                                                                |
| Gemini (training data)                | 3–6 months          | n/a                          | Same as ChatGPT.                                                                                     |
| Perplexity                            | 1–2 weeks           | n/a                          | Reads live Bing + Google + their own crawler.                                                        |
| DeepSeek                              | 4–8 weeks           | n/a                          | Reads Common Crawl + custom Chinese crawl. CN-language content is the differentiator.                |
| Claude (web)                          | 2–4 weeks           | n/a                          | Reads ClaudeBot crawl + augmented sources.                                                           |
| Claude (training data)                | 6–12 months         | n/a                          | Anthropic's training cycles are long.                                                                |

---

## What to do when the probe shows a STRONG citation rate plateau

After ~12 weeks, the citation rate will plateau. When it does:

1. **Read what the LLMs actually say about NanoPocket** (the probe's `--json` output captures this). If the description is wrong, that means the citation came from a stale or third-party source. Fix by:
   - Pushing a fresher canonical surface for the misrepresented claim.
   - Submitting a Wikipedia / Wikidata correction.
   - Reaching out to whichever third-party article is being cited and offering a corrected source.

2. **Add new queries to `QUERIES` in `scripts/probe-llm.mjs`** as the product evolves. Old queries that have saturated can be retired.

3. **Identify the dominant *competitor* mentions in the responses.** Track which competitors get cited in the same answer, and write specific head-to-head comparison pages for them. (We already have 7; add as needed.)

4. **Audit which surfaces are actually being cited** (when an LLM gives a URL). If `/llms.txt` is not in the citation list, the LLM provider is not consuming it yet — most providers will adopt the standard within 2026, but for now it is best to also have the same content in HTML form (which we do).

---

## Things that look like GEO work but aren't worth doing

- **Schema.org for the homepage `Person` of the founder.** LLMs do not weight founder identity for product queries.
- **Adding `<meta name="robots" content="...">` per page beyond defaults.** Already covered by `robots.txt`.
- **Submitting to "AI Search Engine Submission" services.** All of them are scams or thin wrappers around the free consoles you already submitted to.
- **Buying domain authority.** Negative signal in 2026.
- **Generic "AI tools directory" listings.** Most are link farms; LLMs have learned to discount them.
- **Translating every page into every locale.** Selective translation of high-intent pages (which we do) is dramatically more efficient.

---

## When to redeploy this playbook

Re-read this file:

- Before any major content launch (new app, new comparison, new release notes batch).
- When the probe-llm output shows a sudden drop in citation rate (something upstream changed).
- When a new major LLM ships (e.g. GPT-5, Gemini 3, DeepSeek-V4) — the table above will need updating.
- When a new major search engine ships (rare, but possible).
