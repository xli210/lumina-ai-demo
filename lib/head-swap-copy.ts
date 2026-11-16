/**
 * /head-swap and /pt-BR/head-swap: one page that answers "where can I swap a whole head, with the hair,
 * in a photo or a video?". On 2026-11-16 ChatGPT named NanoPocket for that question but linked the home
 * page; this gives it a page about exactly that, in English and in Portuguese (where most of November's
 * ChatGPT sign-ups landed).
 *
 * Photo figures come from the tools' constants. Video figures are the ones on /video-head-swap (from
 * public/facestudio-v/index.html "New in 2.5"); change them there and here together.
 */
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, HEAD_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { FACESTUDIO_MAX_FACES } from "@/lib/facestudio";
import { FACESTUDIO_V_NAME } from "@/lib/facestudio-v";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_MAX_VARIATIONS, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import {
  FREE_VIDEO_HEAD_SWAP_BEST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_FAST_CREDITS,
  FREE_VIDEO_HEAD_SWAP_SECONDS,
  PHOTO_FACE_SWAP_MAX_SIZE,
} from "@/lib/free-tier";

export const HEAD_SWAP_PATH = "/head-swap";
export const HEAD_SWAP_MODIFIED = "2026-11-16";
/** Longest video head swap on an account that has topped up. */
const VIDEO_HEAD_SWAP_MAX_SECONDS = 12;

const PRO_FREE = Math.floor(SIGNUP_GRANT_CREDITS / HEADSWAP_PRO_CREDITS_PER_IMAGE);

export interface HeadSwapTool {
  name: string;
  href: string;
  kind: string;
  bestFor: string;
  price: string;
  output: string;
}

export interface HeadSwapCopy {
  title: string;
  description: string;
  h1: string;
  answer: string;
  cta: string;
  toolsHeading: string;
  toolHead: { tool: string; bestFor: string; price: string; output: string };
  tools: HeadSwapTool[];
  vsHeading: string;
  vs: { term: string; text: string }[];
  howHeading: string;
  steps: string[];
  tipsHeading: string;
  tips: string[];
  diffusionHeading: string;
  diffusion: string;
  faqHeading: string;
  faq: { q: string; a: string }[];
  consent: string;
  more: string;
}

export const HEAD_SWAP_COPY: Record<"en" | "pt-BR", HeadSwapCopy> = {
  en: {
    title: "AI Head Swap Online: Whole Head with Hair, Photo and Video",
    description: `Swap a whole head, face, hair and head shape, in a photo or a video, in your browser. ${HEADSWAP_PRO_NAME} for photos, Headswap Best and Fast for video. Free to try with ${SIGNUP_GRANT_CREDITS} credits, in full resolution or 1080p/4K.`,
    h1: "AI head swap online: the whole head, with the hair, in photos and video",
    answer: `A head swap replaces a person's whole head (face, hair and head shape) with the one in a reference photo, while the body, clothes, background and everyone else stay as they were. A face swap changes only the face and keeps the original hair. NanoPocket does head swaps in the browser for photos (${HEADSWAP_PRO_NAME}, and the head mode of ${FACE_STUDIO_NAME}) and for video (Headswap Best and Headswap Fast in ${FACESTUDIO_V_NAME}). All of them are diffusion models. A new account gets ${SIGNUP_GRANT_CREDITS} free credits, enough for ${PRO_FREE} photo head swaps at the photo's own resolution or a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second video head swap in 1080p or 4K.`,
    cta: "Try a head swap free",
    toolsHeading: "Which tool for which head swap",
    toolHead: { tool: "Tool", bestFor: "Best for", price: "Credits and limits", output: "Output" },
    tools: [
      {
        name: HEADSWAP_PRO_NAME,
        href: "/headswap-pro",
        kind: "Photo",
        bestFor: "One head in a portrait or a group photo: click the person to change",
        price: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} credits per image, up to ${HEADSWAP_PRO_MAX_VARIATIONS} variations per run; ${PRO_FREE} free with the sign-up credits`,
        output: "The photo's own resolution",
      },
      {
        name: `${FACE_STUDIO_NAME} (head mode)`,
        href: "/face-studio",
        kind: "Photo",
        bestFor: `Group photos: up to ${FACESTUDIO_MAX_FACES} faces in one render, with a whole-head mode`,
        price: `${HEAD_SWAP_CREDITS} credits per head`,
        output: `Source resolution, up to ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        name: "Headswap Best",
        href: "/video-head-swap",
        kind: "Video",
        bestFor: "The highest quality on a short clip",
        price: `5 s clip 149 credits, 10 s 218; up to ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s for ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} credits on a free account); about 81 to 95 s per 100 frames`,
        output: "1080p or 4K, original sound kept",
      },
      {
        name: "Headswap Fast",
        href: "/video-head-swap",
        kind: "Video",
        bestFor: "A first try on a new clip: about 40% faster, about 35% fewer credits",
        price: `5 s clip 102 credits, 10 s 143; up to ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s for ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} credits on a free account); about 42 to 60 s per 100 frames`,
        output: "1080p or 4K, original sound kept",
      },
    ],
    vsHeading: "Head swap or face swap?",
    vs: [
      { term: "Head swap", text: "The hair and head shape matter, or you want a completely new look. The new head is redrawn to match the pose, light and skin tone of the original." },
      { term: "Face swap", text: "You want a different face but the same hair, expression and look. It is faster and handles video up to 60 seconds." },
    ],
    howHeading: "How to do a head swap online",
    steps: [
      "Create a free NanoPocket account (email, no card).",
      `Open ${HEADSWAP_PRO_NAME} for a photo, or ${FACESTUDIO_V_NAME} and choose Headswap Best or Headswap Fast for a video.`,
      "Upload the photo or video, then a clear, front-facing photo of the new head.",
      "In a group photo or a video with several people, choose the person to change. The price is shown before you start, and a failed job costs nothing.",
    ],
    tipsHeading: "Tips for a natural result",
    tips: [
      "Use a sharp, front-facing reference photo with the whole head and hair visible.",
      "A reference with a similar head angle and lighting blends best.",
      "The head to replace should be large enough to see clearly and not covered by hands or props.",
      "In heavy backlight or lens flare, a video head swap can lose the head for a moment.",
    ],
    diffusionHeading: "Why the head swap uses diffusion",
    diffusion: "A typical face swapper (a GAN) pastes a new inner face and keeps the original hair and outline, which is why some swaps look like a mask. A diffusion model redraws the whole head in the pose and light of the original, so the hair, hairline and head shape can change too.",
    faqHeading: "Questions",
    faq: [
      {
        q: "What is an AI head swap?",
        a: "An AI head swap replaces a person's whole head in a photo or video, the face, hair and head shape, with the head from a reference photo. The body, clothes, background and other people stay as they were. A face swap changes only the face.",
      },
      {
        q: "Where can I do a head swap online, with the hair?",
        a: `On nanopocket.ai, in the browser: ${HEADSWAP_PRO_NAME} for photos, the head mode of ${FACE_STUDIO_NAME} for several people in one photo, and Headswap Best or Headswap Fast in ${FACESTUDIO_V_NAME} for video. All of them replace the hair and head shape, not just the face.`,
      },
      {
        q: "Can I try a head swap for free, and in what quality?",
        a: `Yes. A new account gets ${SIGNUP_GRANT_CREDITS} free credits, with no card: enough for ${PRO_FREE} photo head swaps at the photo's own resolution, or a ${FREE_VIDEO_HEAD_SWAP_SECONDS}-second video head swap (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} credits with Headswap Fast, ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} with Headswap Best) in 1080p, or in 4K with Headswap Fast. Free results carry a NanoPocket watermark until the first top-up.`,
      },
      {
        q: "Can I swap a head in a group photo?",
        a: `Yes. ${HEADSWAP_PRO_NAME} finds everyone in the photo and you click the person to change; only that head changes. To change several faces in one render, ${FACE_STUDIO_NAME} takes up to ${FACESTUDIO_MAX_FACES} faces in one photo, each with its own reference.`,
      },
      {
        q: "How long can a video head swap be?",
        a: `Up to ${VIDEO_HEAD_SWAP_MAX_SECONDS} seconds on an account that has topped up, and ${FREE_VIDEO_HEAD_SWAP_SECONDS} seconds on one that has not. For longer videos, a video face swap runs up to 60 seconds and keeps the original hair.`,
      },
      {
        q: "Is it a diffusion model or a GAN?",
        a: "Every NanoPocket head swap, for photos and for video, is a diffusion model. That is what lets it redraw the hair and head shape instead of pasting an inner face.",
      },
    ],
    consent: "Use a face only if you have the right to. The video studio asks you to confirm it before a video starts.",
    more: "More detail: video head swap modes compared on /video-head-swap, and how diffusion differs from a GAN in the blog post on diffusion head swap.",
  },
  "pt-BR": {
    title: "Troca de cabeça com IA online: cabeça inteira com cabelo, em foto e vídeo",
    description: `Troque a cabeça inteira, rosto, cabelo e formato da cabeça, numa foto ou num vídeo, no navegador. ${HEADSWAP_PRO_NAME} para fotos, Headswap Best e Fast para vídeo. Teste grátis com ${SIGNUP_GRANT_CREDITS} créditos, em resolução original ou 1080p/4K.`,
    h1: "Troca de cabeça com IA online: a cabeça inteira, com o cabelo, em fotos e vídeos",
    answer: `A troca de cabeça substitui a cabeça inteira de uma pessoa (rosto, cabelo e formato da cabeça) pela de uma foto de referência, enquanto o corpo, a roupa, o fundo e as outras pessoas continuam como estavam. A troca de rosto muda só o rosto e mantém o cabelo original. A NanoPocket faz troca de cabeça no navegador para fotos (${HEADSWAP_PRO_NAME} e o modo cabeça do ${FACE_STUDIO_NAME}) e para vídeo (Headswap Best e Headswap Fast no ${FACESTUDIO_V_NAME}). Todos são modelos de difusão. Uma conta nova recebe ${SIGNUP_GRANT_CREDITS} créditos grátis, o suficiente para ${PRO_FREE} trocas de cabeça em foto na resolução original ou uma troca de cabeça em vídeo de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos em 1080p ou 4K.`,
    cta: "Testar a troca de cabeça grátis",
    toolsHeading: "Qual ferramenta para cada troca de cabeça",
    toolHead: { tool: "Ferramenta", bestFor: "Ideal para", price: "Créditos e limites", output: "Resultado" },
    tools: [
      {
        name: HEADSWAP_PRO_NAME,
        href: "/headswap-pro",
        kind: "Foto",
        bestFor: "Uma cabeça num retrato ou numa foto em grupo: clique na pessoa que quer mudar",
        price: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} créditos por imagem, até ${HEADSWAP_PRO_MAX_VARIATIONS} variações por vez; ${PRO_FREE} grátis com os créditos do cadastro`,
        output: "A resolução original da foto",
      },
      {
        name: `${FACE_STUDIO_NAME} (modo cabeça)`,
        href: "/face-studio",
        kind: "Foto",
        bestFor: `Fotos em grupo: até ${FACESTUDIO_MAX_FACES} rostos numa só vez, com modo de cabeça inteira`,
        price: `${HEAD_SWAP_CREDITS} créditos por cabeça`,
        output: `Resolução original, até ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        name: "Headswap Best",
        href: "/video-head-swap",
        kind: "Vídeo",
        bestFor: "A melhor qualidade num clipe curto",
        price: `Clipe de 5 s: 149 créditos; 10 s: 218; até ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s por ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} créditos numa conta gratuita); cerca de 81 a 95 s por 100 quadros`,
        output: "1080p ou 4K, com o som original",
      },
      {
        name: "Headswap Fast",
        href: "/video-head-swap",
        kind: "Vídeo",
        bestFor: "Um primeiro teste num clipe novo: cerca de 40% mais rápido e 35% menos créditos",
        price: `Clipe de 5 s: 102 créditos; 10 s: 143; até ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s por ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} créditos numa conta gratuita); cerca de 42 a 60 s por 100 quadros`,
        output: "1080p ou 4K, com o som original",
      },
    ],
    vsHeading: "Troca de cabeça ou troca de rosto?",
    vs: [
      { term: "Troca de cabeça", text: "O cabelo e o formato da cabeça importam, ou você quer um visual totalmente novo. A nova cabeça é redesenhada para combinar com a pose, a luz e o tom de pele do original." },
      { term: "Troca de rosto", text: "Você quer outro rosto, mas o mesmo cabelo, expressão e visual. É mais rápida e aceita vídeos de até 60 segundos." },
    ],
    howHeading: "Como fazer uma troca de cabeça online",
    steps: [
      "Crie uma conta gratuita na NanoPocket (e-mail, sem cartão).",
      `Abra o ${HEADSWAP_PRO_NAME} para uma foto, ou o ${FACESTUDIO_V_NAME} e escolha Headswap Best ou Headswap Fast para um vídeo.`,
      "Envie a foto ou o vídeo e depois uma foto nítida, de frente, da nova cabeça.",
      "Numa foto em grupo ou num vídeo com várias pessoas, escolha quem quer mudar. O preço aparece antes de começar, e um trabalho que falha não custa nada.",
    ],
    tipsHeading: "Dicas para um resultado natural",
    tips: [
      "Use uma foto de referência nítida, de frente, com a cabeça e o cabelo inteiros à vista.",
      "Uma referência com ângulo e luz parecidos se mistura melhor.",
      "A cabeça a trocar deve aparecer grande e nítida, sem mãos ou objetos na frente.",
      "Com contraluz forte ou reflexo de lente, a troca de cabeça em vídeo pode perder a cabeça por um instante.",
    ],
    diffusionHeading: "Por que a troca de cabeça usa difusão",
    diffusion: "Um trocador de rosto comum (uma GAN) cola um novo rosto interno e mantém o cabelo e o contorno originais, e por isso algumas trocas parecem uma máscara. Um modelo de difusão redesenha a cabeça inteira na pose e na luz do original, então o cabelo, a linha do cabelo e o formato da cabeça também podem mudar.",
    faqHeading: "Perguntas",
    faq: [
      {
        q: "O que é troca de cabeça com IA?",
        a: "A troca de cabeça com IA substitui a cabeça inteira de uma pessoa numa foto ou vídeo, o rosto, o cabelo e o formato da cabeça, pela cabeça de uma foto de referência. O corpo, a roupa, o fundo e as outras pessoas continuam iguais. A troca de rosto muda só o rosto.",
      },
      {
        q: "Onde fazer troca de cabeça online, com o cabelo?",
        a: `No nanopocket.ai, no navegador: ${HEADSWAP_PRO_NAME} para fotos, o modo cabeça do ${FACE_STUDIO_NAME} para várias pessoas numa foto, e Headswap Best ou Headswap Fast no ${FACESTUDIO_V_NAME} para vídeo. Todos trocam o cabelo e o formato da cabeça, não só o rosto.`,
      },
      {
        q: "Dá para testar a troca de cabeça de graça, e em que qualidade?",
        a: `Sim. Uma conta nova recebe ${SIGNUP_GRANT_CREDITS} créditos grátis, sem cartão: o suficiente para ${PRO_FREE} trocas de cabeça em foto na resolução original, ou uma troca de cabeça em vídeo de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} créditos no Headswap Fast, ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} no Headswap Best) em 1080p, ou em 4K no Headswap Fast. Os resultados gratuitos têm a marca d'água da NanoPocket até a primeira recarga.`,
      },
      {
        q: "Dá para trocar a cabeça numa foto em grupo?",
        a: `Sim. O ${HEADSWAP_PRO_NAME} encontra todas as pessoas da foto e você clica em quem quer mudar; só essa cabeça muda. Para mudar vários rostos de uma vez, o ${FACE_STUDIO_NAME} aceita até ${FACESTUDIO_MAX_FACES} rostos numa foto, cada um com sua referência.`,
      },
      {
        q: "Qual a duração máxima de uma troca de cabeça em vídeo?",
        a: `Até ${VIDEO_HEAD_SWAP_MAX_SECONDS} segundos numa conta que já recarregou e ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos numa que ainda não. Para vídeos mais longos, a troca de rosto em vídeo vai até 60 segundos e mantém o cabelo original.`,
      },
      {
        q: "É um modelo de difusão ou uma GAN?",
        a: "Todas as trocas de cabeça da NanoPocket, em foto e em vídeo, usam modelos de difusão. É isso que permite redesenhar o cabelo e o formato da cabeça em vez de colar um rosto interno.",
      },
    ],
    consent: "Use um rosto só se tiver o direito de usá-lo. O estúdio de vídeo pede que você confirme isso antes de começar um vídeo.",
    more: "Mais detalhes (em inglês): os modos de troca de cabeça em vídeo comparados em /video-head-swap, e a diferença entre difusão e GAN no artigo do blog sobre troca de cabeça por difusão.",
  },
};
