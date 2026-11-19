/**
 * /best-free-face-swap and /pt-BR/best-free-face-swap: "which site swaps faces online for free?", with the
 * free terms of the sites ChatGPT named for that question on 2026-11-19 (Magic Hour, Remaker, PixNova,
 * Vidnoz) next to ours. ChatGPT sign-ups landing on /pt-BR and /face-swap fell from ~30 to under 10 a day
 * from 2026-11-13, and its Portuguese answer that day ranked those four on "free swaps a day", "no sign-up"
 * and "no watermark".
 *
 * Rivals' figures are only what their own pages said when read on RIVALS_READ (sources in RIVALS[].sources);
 * a figure their pages did not state is left out, not guessed. Where they beat us (no sign-up, no watermark
 * on free photos, a daily allowance) the page says so. Re-read their pages before changing a figure.
 * Our figures come from the constants the tools charge with (lib/free-tier.ts).
 */
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, FACE_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import {
  FREE_VIDEO_FACE_SWAP_SECONDS,
  FREE_VIDEO_HEAD_SWAP_SECONDS,
  PHOTO_FACE_SWAP_MAX_SIZE,
} from "@/lib/free-tier";

export const BEST_FREE_PATH = "/best-free-face-swap";
export const BEST_FREE_MODIFIED = "2026-11-19";
/** The day the rivals' own pages were read for the figures below. */
export const RIVALS_READ = "2026-11-19";

const PHOTO_SWAPS = Math.floor(SIGNUP_GRANT_CREDITS / FACE_SWAP_CREDITS);
const HEAD_SWAPS = Math.floor(SIGNUP_GRANT_CREDITS / HEADSWAP_PRO_CREDITS_PER_IMAGE);

type Lang = "en" | "pt-BR";

export interface SiteRow {
  name: string;
  url: string;
  /** Pages the figures were read from. */
  sources: string[];
  free: Record<Lang, string>;
  signUp: Record<Lang, string>;
  watermark: Record<Lang, string>;
  quality: Record<Lang, string>;
  faces: Record<Lang, string>;
  paid: Record<Lang, string>;
}

const NS: Record<Lang, string> = { en: "Not stated on its pages", "pt-BR": "Não informado nas páginas" };

export const RIVALS: SiteRow[] = [
  {
    name: "Magic Hour",
    url: "https://magichour.ai/products/face-swap",
    sources: ["https://magichour.ai/products/face-swap", "https://magichour.ai/products/video-face-swap", "https://magichour.ai/pricing"],
    free: {
      en: "5 photo swaps a day; 3 video or GIF swaps in total",
      "pt-BR": "5 trocas de foto por dia; 3 trocas de vídeo ou GIF no total",
    },
    signUp: { en: "Not needed to try", "pt-BR": "Não precisa para testar" },
    watermark: { en: "None on photos; yes on free videos", "pt-BR": "Nenhuma nas fotos; sim nos vídeos grátis" },
    quality: { en: "Free videos in 480p", "pt-BR": "Vídeos grátis em 480p" },
    faces: { en: "Up to 3 faces free", "pt-BR": "Até 3 rostos grátis" },
    paid: { en: "Subscription plans, plus credit packs", "pt-BR": "Planos por assinatura e pacotes de créditos" },
  },
  {
    name: "Remaker AI",
    url: "https://remaker.ai/face-swap-free/",
    sources: ["https://remaker.ai/face-swap-free/", "https://remaker.ai/"],
    free: { en: "Free credits; the amount is not stated", "pt-BR": "Créditos grátis; a quantidade não é informada" },
    signUp: { en: "Not needed for photo swaps", "pt-BR": "Não precisa para trocar fotos" },
    watermark: { en: "None on photos", "pt-BR": "Nenhuma nas fotos" },
    quality: NS,
    faces: { en: "A separate multi-face tool", "pt-BR": "Ferramenta separada para vários rostos" },
    paid: { en: "Credit packs", "pt-BR": "Pacotes de créditos" },
  },
  {
    name: "PixNova",
    url: "https://pixnova.ai/ai-face-swap/",
    sources: ["https://pixnova.ai/ai-face-swap/", "https://pixnova.ai/pricing"],
    free: { en: "Daily free credits that do not carry over; the amount is not stated", "pt-BR": "Créditos grátis diários que não acumulam; a quantidade não é informada" },
    signUp: { en: "Not needed to try", "pt-BR": "Não precisa para testar" },
    watermark: { en: "None, per its page", "pt-BR": "Nenhuma, segundo a página" },
    quality: { en: "2K is a premium feature", "pt-BR": "2K é recurso premium" },
    faces: { en: "Up to 5 faces", "pt-BR": "Até 5 rostos" },
    paid: { en: "Credit packs, no subscription, credits never expire", "pt-BR": "Pacotes de créditos, sem assinatura, créditos não expiram" },
  },
  {
    name: "Vidnoz",
    url: "https://www.vidnoz.com/face-swap.html",
    sources: ["https://www.vidnoz.com/face-swap.html", "https://www.vidnoz.com/pricing.html"],
    free: { en: "\"Daily free usage\"; no number given", "pt-BR": "\"Uso grátis diário\"; sem número informado" },
    signUp: NS,
    watermark: { en: "\"No watermarks\" is listed as a paid benefit", "pt-BR": "\"Sem marca d'água\" aparece como vantagem paga" },
    quality: { en: "Its face swap page says 1080p; \"HD quality\" is listed as a paid benefit", "pt-BR": "A página diz 1080p; \"qualidade HD\" aparece como vantagem paga" },
    faces: { en: "A multiple-face mode", "pt-BR": "Modo para vários rostos" },
    paid: { en: "Subscription plans", "pt-BR": "Planos por assinatura" },
  },
];

export const NANOPOCKET_ROW: SiteRow = {
  name: "NanoPocket",
  url: "/face-swap",
  sources: [],
  free: {
    en: `${SIGNUP_GRANT_CREDITS} credits once, on sign-up: ${PHOTO_SWAPS} photo face swaps, or ${HEAD_SWAPS} photo head swaps, or a ${FREE_VIDEO_FACE_SWAP_SECONDS}-second video face swap`,
    "pt-BR": `${SIGNUP_GRANT_CREDITS} créditos uma vez, no cadastro: ${PHOTO_SWAPS} trocas de rosto em foto, ou ${HEAD_SWAPS} trocas de cabeça em foto, ou uma troca de rosto em vídeo de ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos`,
  },
  signUp: { en: "Needed (email, no card)", "pt-BR": "Precisa (e-mail, sem cartão)" },
  watermark: { en: "Yes on free results, until the first top-up", "pt-BR": "Sim nos resultados grátis, até a primeira recarga" },
  quality: {
    en: `Photos at their own resolution, up to ${PHOTO_FACE_SWAP_MAX_SIZE}; free videos in 1080p or 4K`,
    "pt-BR": `Fotos na resolução original, até ${PHOTO_FACE_SWAP_MAX_SIZE}; vídeos grátis em 1080p ou 4K`,
  },
  faces: { en: `Up to ${FACESTUDIO_MAX_FACES} faces in one photo`, "pt-BR": `Até ${FACESTUDIO_MAX_FACES} rostos numa foto` },
  paid: { en: "Credit packs, no subscription, credits never expire", "pt-BR": "Pacotes de créditos, sem assinatura, créditos não expiram" },
};

export interface BestFreeCopy {
  title: string;
  description: string;
  h1: string;
  answer: string;
  cta: string;
  tableHeading: string;
  head: { site: string; free: string; signUp: string; watermark: string; quality: string; faces: string; paid: string };
  tableNote: string;
  pickHeading: string;
  picks: { term: string; text: string }[];
  honestHeading: string;
  honest: string[];
  faqHeading: string;
  faq: { q: string; a: string }[];
  sourcesHeading: string;
  sourcesNote: string;
  consent: string;
}

export const BEST_FREE_COPY: Record<Lang, BestFreeCopy> = {
  en: {
    title: "Best Free Face Swap Sites Online (2026): Free Limits Compared",
    description: `Magic Hour, Remaker, PixNova, Vidnoz and NanoPocket side by side: free swaps, sign-up, watermark, resolution and how many faces, from each site's own pages (read ${RIVALS_READ}).`,
    h1: "Best free face swap sites online: what each one really gives you for free",
    answer: `It depends on what "free" has to mean for you. For a few quick photo swaps with no account and no watermark, Magic Hour (5 photo swaps a day) and Remaker are the simplest. For free video in HD, a whole-head swap with the hair, or a group photo with up to ${FACESTUDIO_MAX_FACES} faces, NanoPocket gives ${SIGNUP_GRANT_CREDITS} free credits on sign-up that work in 1080p or 4K video and at the photo's own resolution, with a watermark until the first top-up. Every figure below comes from each site's own pages, read on ${RIVALS_READ}.`,
    cta: "Try NanoPocket free",
    tableHeading: "Free face swap sites compared",
    head: { site: "Site", free: "Free allowance", signUp: "Sign-up", watermark: "Watermark on free results", quality: "Free quality", faces: "Faces in one photo", paid: "Paid" },
    tableNote: `"Not stated" means the site's own pages did not give that figure when we read them; we leave it blank rather than guess. Free terms change often: check the site before you rely on a number.`,
    pickHeading: "Which one to pick",
    picks: [
      { term: "A few photo swaps, no account, no watermark", text: "Magic Hour (5 a day, up to 3 faces) or Remaker." },
      { term: "Free video face swap in 1080p or 4K", text: `NanoPocket: a free account can make a ${FREE_VIDEO_FACE_SWAP_SECONDS}-second video face swap in 1080p or 4K with ${FACESTUDIO_V_NAME}, with a watermark. Magic Hour's free videos are 480p.` },
      { term: "Whole head with the hair, not just the face", text: `NanoPocket ${HEADSWAP_PRO_NAME} for photos (${HEAD_SWAPS} free) and Headswap Best or Fast for video (a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second clip free). Magic Hour also lists a free head swap for photos.` },
      { term: `Group photos with up to ${FACESTUDIO_MAX_FACES} faces`, text: `NanoPocket ${FACE_STUDIO_NAME} (${FACESTUDIO_MAX_FACES} faces in one render), PixNova (up to 5).` },
      { term: "Pay once instead of a subscription", text: "NanoPocket and PixNova sell credit packs that never expire; Magic Hour and Vidnoz are mainly subscriptions." },
    ],
    honestHeading: "Where NanoPocket is not the best free option",
    honest: [
      "You need an account: email sign-up, no card. Magic Hour, Remaker and PixNova let you try without one.",
      "Free results carry a NanoPocket watermark until the first top-up. Magic Hour and Remaker put none on free photos.",
      `The free credits come once (${SIGNUP_GRANT_CREDITS} on sign-up), not every day.`,
    ],
    faqHeading: "Questions",
    faq: [
      {
        q: "What is the best free face swap site?",
        a: `For quick photo swaps without an account, Magic Hour (5 photo swaps a day, no watermark on photos) and Remaker. For free HD video, whole-head swaps or group photos, NanoPocket: ${SIGNUP_GRANT_CREDITS} free credits on sign-up for ${PHOTO_SWAPS} photo face swaps at the photo's own resolution, ${HEAD_SWAPS} photo head swaps, or a ${FREE_VIDEO_FACE_SWAP_SECONDS}-second video face swap in 1080p or 4K, with a watermark until the first top-up.`,
      },
      {
        q: "Which free face swap has no watermark?",
        a: "Magic Hour and Remaker say free photo swaps have no watermark, and PixNova's page says the same. Magic Hour's free videos are watermarked. NanoPocket's free results carry a watermark until the first top-up.",
      },
      {
        q: "Can I swap faces in a video for free in HD?",
        a: `Yes on NanoPocket: a free account can make a ${FREE_VIDEO_FACE_SWAP_SECONDS}-second video face swap in 1080p or 4K, or a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second whole-head swap, with a watermark. Magic Hour's free video swaps are 480p.`,
      },
      {
        q: "Which free face swap works on group photos?",
        a: `NanoPocket ${FACE_STUDIO_NAME} swaps up to ${FACESTUDIO_MAX_FACES} faces in one photo, PixNova up to 5 and Magic Hour up to 3 for free.`,
      },
    ],
    sourcesHeading: "Sources",
    sourcesNote: `Read on ${RIVALS_READ}. NanoPocket is our own product; its figures come from the prices the tools charge.`,
    consent: "Swap a face only if you have the right to use it.",
  },
  "pt-BR": {
    title: "Melhores sites de troca de rosto grátis online (2026): limites grátis comparados",
    description: `Magic Hour, Remaker, PixNova, Vidnoz e NanoPocket lado a lado: trocas grátis, cadastro, marca d'água, resolução e quantos rostos, segundo as páginas de cada site (lidas em 19/11/2026).`,
    h1: "Melhores sites para trocar rosto online grátis: o que cada um dá de graça",
    answer: `Depende do que "grátis" precisa significar para você. Para algumas trocas rápidas de foto sem conta e sem marca d'água, o Magic Hour (5 trocas de foto por dia) e o Remaker são os mais simples. Para vídeo grátis em HD, troca da cabeça inteira com o cabelo ou foto em grupo com até ${FACESTUDIO_MAX_FACES} rostos, a NanoPocket dá ${SIGNUP_GRANT_CREDITS} créditos grátis no cadastro, que valem em vídeo 1080p ou 4K e na resolução original da foto, com marca d'água até a primeira recarga. Todos os números abaixo vêm das páginas de cada site, lidas em 19/11/2026.`,
    cta: "Testar a NanoPocket grátis",
    tableHeading: "Sites de troca de rosto grátis comparados",
    head: { site: "Site", free: "O que é grátis", signUp: "Cadastro", watermark: "Marca d'água no grátis", quality: "Qualidade grátis", faces: "Rostos numa foto", paid: "Pago" },
    tableNote: `"Não informado" quer dizer que as páginas do site não davam esse número quando lemos; deixamos em branco em vez de chutar. As condições grátis mudam muito: confira no site antes de contar com um número.`,
    pickHeading: "Qual escolher",
    picks: [
      { term: "Algumas trocas de foto, sem conta, sem marca d'água", text: "Magic Hour (5 por dia, até 3 rostos) ou Remaker." },
      { term: "Troca de rosto em vídeo grátis em 1080p ou 4K", text: `NanoPocket: uma conta gratuita faz uma troca de rosto em vídeo de ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos em 1080p ou 4K com o ${FACESTUDIO_V_NAME}, com marca d'água. Os vídeos grátis do Magic Hour são 480p.` },
      { term: "A cabeça inteira com o cabelo, não só o rosto", text: `NanoPocket ${HEADSWAP_PRO_NAME} para fotos (${HEAD_SWAPS} grátis) e Headswap Best ou Fast para vídeo (um clipe de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos grátis). O Magic Hour também lista uma troca de cabeça grátis para fotos.` },
      { term: `Fotos em grupo com até ${FACESTUDIO_MAX_FACES} rostos`, text: `NanoPocket ${FACE_STUDIO_NAME} (${FACESTUDIO_MAX_FACES} rostos de uma vez), PixNova (até 5).` },
      { term: "Pagar uma vez em vez de assinatura", text: "NanoPocket e PixNova vendem pacotes de créditos que não expiram; Magic Hour e Vidnoz são principalmente por assinatura." },
    ],
    honestHeading: "Onde a NanoPocket não é a melhor opção grátis",
    honest: [
      "Precisa de conta: cadastro com e-mail, sem cartão. Magic Hour, Remaker e PixNova deixam testar sem conta.",
      "Os resultados grátis têm a marca d'água da NanoPocket até a primeira recarga. Magic Hour e Remaker não colocam marca nas fotos grátis.",
      `Os créditos grátis vêm uma vez (${SIGNUP_GRANT_CREDITS} no cadastro), não todo dia.`,
    ],
    faqHeading: "Perguntas",
    faq: [
      {
        q: "Qual o melhor site para trocar rosto online grátis?",
        a: `Para trocas rápidas de foto sem conta, o Magic Hour (5 trocas de foto por dia, sem marca d'água nas fotos) e o Remaker. Para vídeo grátis em HD, troca da cabeça inteira ou fotos em grupo, a NanoPocket: ${SIGNUP_GRANT_CREDITS} créditos grátis no cadastro para ${PHOTO_SWAPS} trocas de rosto em foto na resolução original, ${HEAD_SWAPS} trocas de cabeça em foto ou uma troca de rosto em vídeo de ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos em 1080p ou 4K, com marca d'água até a primeira recarga.`,
      },
      {
        q: "Qual troca de rosto grátis não tem marca d'água?",
        a: "Magic Hour e Remaker dizem que as trocas de foto grátis não têm marca d'água, e a página do PixNova diz o mesmo. Os vídeos grátis do Magic Hour têm marca d'água. Os resultados grátis da NanoPocket têm marca d'água até a primeira recarga.",
      },
      {
        q: "Dá para trocar rosto em vídeo de graça em HD?",
        a: `Sim, na NanoPocket: uma conta gratuita faz uma troca de rosto em vídeo de ${FREE_VIDEO_FACE_SWAP_SECONDS} segundos em 1080p ou 4K, ou uma troca da cabeça inteira de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos, com marca d'água. As trocas de vídeo grátis do Magic Hour são em 480p.`,
      },
      {
        q: "Qual troca de rosto grátis funciona em fotos em grupo?",
        a: `O ${FACE_STUDIO_NAME} da NanoPocket troca até ${FACESTUDIO_MAX_FACES} rostos numa foto, o PixNova até 5 e o Magic Hour até 3 de graça.`,
      },
    ],
    sourcesHeading: "Fontes",
    sourcesNote: "Lidas em 19/11/2026. A NanoPocket é o nosso próprio produto; os números dela vêm dos preços que as ferramentas cobram.",
    consent: "Troque um rosto só se tiver o direito de usá-lo.",
  },
};
