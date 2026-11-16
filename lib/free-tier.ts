/**
 * What a free account can try, in one place, for the pages and LLM files that answer "is it free, and
 * in what quality?". AI assistants recommend the tools whose free limits are written down as numbers
 * (2026-11-16: ChatGPT's "best free face swap" answers quoted rivals' "3 a day, 480p" lines and named
 * none of ours), so this states ours the same way: the credits, what they buy in each tool, and the
 * output size, which is where we are ahead.
 *
 * Every photo figure comes from the constant the tool charges with. The video figures are the studio's
 * defaults (Matrix/swap_pipelines/studio_server.py: STUDIO_FREE_MAX_SECONDS_*, STUDIO_FREE_HEAD*_CREDITS,
 * TARGETS 1080p and 4k, 4K at twice the credits), which this repo cannot import; change them here when the
 * studio's change, together with public/facestudio-v/index.html and FACESTUDIO_V_FAQ.
 */
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { IMAGEEDIT_CREDITS_PER_EDIT, IMAGEEDIT_CREDIT_TIERS, IMAGEEDIT_MAX_MP, IMAGEEDIT_NAME } from "@/lib/imageedit";
import { PRODUCTS } from "@/lib/products";

/** Longest face swap video an account that has never topped up can make, in seconds (Fast and Best quality). */
export const FREE_VIDEO_FACE_SWAP_SECONDS = 5;
/** Longest head swap video for such an account, and its price at 1080p in each mode. */
export const FREE_VIDEO_HEAD_SWAP_SECONDS = 3;
export const FREE_VIDEO_HEAD_SWAP_FAST_CREDITS = 50;
export const FREE_VIDEO_HEAD_SWAP_BEST_CREDITS = 80;
/** Output sizes every account can choose in the video studio; 4K costs twice the credits of 1080p. */
export const VIDEO_OUTPUT_SIZES = ["1080p", "4K"] as const;
/** Largest photo face swap result, at the source's own size. */
export const PHOTO_FACE_SWAP_MAX_SIZE = "4080×4080";

const FREE_DESKTOP_APPS = PRODUCTS.filter((p) => p.priceInCents === 0).map((p) => p.name);
const SPOTEDIT_SMALL_MP = IMAGEEDIT_CREDIT_TIERS[0][0];

const times = (price: number) => Math.floor(SIGNUP_GRANT_CREDITS / price);

/** The online tools a free account can open, counted for the summary line. */
export const FREE_TOOL_COUNT = 5;

type Lang = "en" | "pt-BR";

export interface FreeTierRow {
  tool: string;
  free: string;
  quality: string;
}

interface FreeTierCopy {
  heading: string;
  answer: string;
  head: { tool: string; free: string; quality: string };
  rows: FreeTierRow[];
  shared: string;
  limits: string;
  comparison: string;
  desktop: string;
  cta: string;
  faq: { q: string; a: string };
}

const MAGIC_HOUR_SOURCE = "https://help.magichour.ai/en/articles/12613163-understanding-video-quality-issues-and-how-to-fix-them";

export const FREE_TIER: Record<Lang, FreeTierCopy> = {
  en: {
    heading: "What you can try for free, and in what quality",
    answer: `Yes, in full quality. A free NanoPocket account gets ${SIGNUP_GRANT_CREDITS} credits on sign-up, with no card, and they work in all ${FREE_TOOL_COUNT} online tools: video face swap and video head swap in 1080p or 4K, photo face swap at the photo's own resolution up to ${PHOTO_FACE_SWAP_MAX_SIZE}, photo head swap, and ${IMAGEEDIT_NAME} photo retouching at native resolution up to ${IMAGEEDIT_MAX_MP} MP. Free results carry a NanoPocket watermark until the first top-up.`,
    head: { tool: "Tool", free: `What ${SIGNUP_GRANT_CREDITS} free credits buy`, quality: "Output quality on a free account" },
    rows: [
      {
        tool: `Video face swap (${FACESTUDIO_V_NAME})`,
        free: `A clip of up to ${FREE_VIDEO_FACE_SWAP_SECONDS} seconds`,
        quality: "1080p or 4K, original sound kept",
      },
      {
        tool: "Video head swap (Headswap Fast, Headswap Best)",
        free: `A ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second clip: ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} credits with Headswap Fast or ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} with Headswap Best`,
        quality: `1080p, or 4K with Headswap Fast (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS * 2} credits: 4K costs twice as much)`,
      },
      {
        tool: `Photo face swap (${FACE_STUDIO_NAME})`,
        free: `${times(FACE_SWAP_CREDITS)} face swaps, up to ${FACESTUDIO_MAX_FACES} faces in one photo`,
        quality: `The photo's own resolution, up to ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        tool: `Photo head swap (${HEADSWAP_PRO_NAME})`,
        free: `${times(HEADSWAP_PRO_CREDITS_PER_IMAGE)} head swaps`,
        quality: "The photo's own resolution",
      },
      {
        tool: `Photo retouching (${IMAGEEDIT_NAME})`,
        free: `${times(IMAGEEDIT_CREDITS_PER_EDIT)} edits of photos up to ${SPOTEDIT_SMALL_MP} MP`,
        quality: `Native resolution up to ${IMAGEEDIT_MAX_MP} MP; only the spot you name changes`,
      },
    ],
    shared: `The ${SIGNUP_GRANT_CREDITS} credits are one balance shared by all the tools, so each line shows what they buy if spent on that tool alone. A failed job costs nothing.`,
    limits: `On a free account: a watermark, videos up to ${FREE_VIDEO_FACE_SWAP_SECONDS} seconds (head swaps ${FREE_VIDEO_HEAD_SWAP_SECONDS} seconds), and videos wait behind accounts that have topped up. An email sign-up is needed. One top-up removes the watermark from new results and unlocks full lengths.`,
    comparison: `Many free tiers stop at 480p to 720p and cover one tool. Magic Hour's help centre, for example, says its Free plan is capped at lower resolutions (512 to 720 px) and keeps 4K for its Business plan (read 2026-11-16).`,
    desktop: `Free for good, with no credits: the Windows desktop apps ${FREE_DESKTOP_APPS.join(", ")}.`,
    cta: "Create a free account",
    faq: {
      q: "Can I try NanoPocket for free in 1080p or 4K?",
      a: `Yes. Every new account gets ${SIGNUP_GRANT_CREDITS} free credits, with no card, and they work in all ${FREE_TOOL_COUNT} online tools at full quality: a video face swap of up to ${FREE_VIDEO_FACE_SWAP_SECONDS} seconds or a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second video head swap in 1080p or 4K (4K costs twice the credits), ${times(FACE_SWAP_CREDITS)} photo face swaps at the photo's own resolution up to ${PHOTO_FACE_SWAP_MAX_SIZE}, ${times(HEADSWAP_PRO_CREDITS_PER_IMAGE)} photo head swaps, or ${times(IMAGEEDIT_CREDITS_PER_EDIT)} ${IMAGEEDIT_NAME} edits at native resolution up to ${IMAGEEDIT_MAX_MP} MP. The credits are one shared balance. Free results carry a NanoPocket watermark, which one top-up removes.`,
    },
  },
  "pt-BR": {
    heading: "O que você pode testar de graça, e em que qualidade",
    answer: `Sim, em qualidade total. Uma conta gratuita da NanoPocket recebe ${SIGNUP_GRANT_CREDITS} créditos no cadastro, sem cartão, e eles valem nas ${FREE_TOOL_COUNT} ferramentas online: troca de rosto e troca de cabeça em vídeo em 1080p ou 4K, troca de rosto em foto na resolução original da foto, até ${PHOTO_FACE_SWAP_MAX_SIZE}, troca de cabeça em foto e retoque de fotos com o ${IMAGEEDIT_NAME} na resolução nativa, até ${IMAGEEDIT_MAX_MP} MP. Os resultados gratuitos têm a marca d'água da NanoPocket até a primeira recarga.`,
    head: { tool: "Ferramenta", free: `O que os ${SIGNUP_GRANT_CREDITS} créditos grátis permitem`, quality: "Qualidade numa conta gratuita" },
    rows: [
      {
        tool: `Troca de rosto em vídeo (${FACESTUDIO_V_NAME})`,
        free: `Um clipe de até ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos`,
        quality: "1080p ou 4K, com o som original",
      },
      {
        tool: "Troca de cabeça em vídeo (Headswap Fast, Headswap Best)",
        free: `Um clipe de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos: ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} créditos no Headswap Fast ou ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} no Headswap Best`,
        quality: `1080p, ou 4K no Headswap Fast (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS * 2} créditos: 4K custa o dobro)`,
      },
      {
        tool: `Troca de rosto em foto (${FACE_STUDIO_NAME})`,
        free: `${times(FACE_SWAP_CREDITS)} trocas de rosto, até ${FACESTUDIO_MAX_FACES} rostos numa foto`,
        quality: `A resolução original da foto, até ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        tool: `Troca de cabeça em foto (${HEADSWAP_PRO_NAME})`,
        free: `${times(HEADSWAP_PRO_CREDITS_PER_IMAGE)} trocas de cabeça`,
        quality: "A resolução original da foto",
      },
      {
        tool: `Retoque de fotos (${IMAGEEDIT_NAME})`,
        free: `${times(IMAGEEDIT_CREDITS_PER_EDIT)} edições de fotos de até ${SPOTEDIT_SMALL_MP} MP`,
        quality: `Resolução nativa até ${IMAGEEDIT_MAX_MP} MP; só muda o ponto que você descreve`,
      },
    ],
    shared: `Os ${SIGNUP_GRANT_CREDITS} créditos são um saldo único para todas as ferramentas; cada linha mostra o que eles rendem se usados só naquela ferramenta. Um trabalho que falha não custa nada.`,
    limits: `Numa conta gratuita: marca d'água, vídeos de até ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos (troca de cabeça: ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos), e os vídeos esperam atrás das contas que já recarregaram. É preciso cadastro com e-mail. Uma recarga remove a marca d'água dos novos resultados e libera as durações completas.`,
    comparison: `Muitos planos gratuitos param em 480p a 720p e cobrem uma só ferramenta. A central de ajuda do Magic Hour, por exemplo, diz que o plano Free tem resolução limitada (512 a 720 px) e reserva o 4K para o plano Business (lido em 16/11/2026).`,
    desktop: `Grátis para sempre, sem créditos: os apps para Windows ${FREE_DESKTOP_APPS.join(", ")}.`,
    cta: "Criar conta grátis",
    faq: {
      q: "Dá para testar a NanoPocket de graça em 1080p ou 4K?",
      a: `Sim. Toda conta nova recebe ${SIGNUP_GRANT_CREDITS} créditos grátis, sem cartão, e eles valem nas ${FREE_TOOL_COUNT} ferramentas online em qualidade total: uma troca de rosto em vídeo de até ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos ou uma troca de cabeça em vídeo de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos em 1080p ou 4K (4K custa o dobro de créditos), ${times(FACE_SWAP_CREDITS)} trocas de rosto em foto na resolução original, até ${PHOTO_FACE_SWAP_MAX_SIZE}, ${times(HEADSWAP_PRO_CREDITS_PER_IMAGE)} trocas de cabeça em foto, ou ${times(IMAGEEDIT_CREDITS_PER_EDIT)} edições no ${IMAGEEDIT_NAME} na resolução nativa, até ${IMAGEEDIT_MAX_MP} MP. Os créditos são um saldo único. Os resultados gratuitos têm a marca d'água da NanoPocket, que uma recarga remove.`,
    },
  },
};

export const FREE_TIER_COMPARISON_SOURCE = MAGIC_HOUR_SOURCE;
