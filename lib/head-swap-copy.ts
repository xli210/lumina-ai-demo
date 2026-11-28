/**
 * /head-swap and /pt-BR/head-swap: one page that answers "where can I swap a whole head, with the hair,
 * in a photo or a video?". On 2026-11-16 ChatGPT named NanoPocket for that question but linked the home
 * page; this gives it a page about exactly that, in English and in Portuguese (where most of November's
 * ChatGPT sign-ups landed). On 2026-11-28 /head-swap was ChatGPT's second landing page for sign-ups, so it
 * went into Spanish, German and Japanese too; those three are translations of the English text, nothing added.
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

/** The languages this page exists in: English at /head-swap, the others at /{lang}/head-swap (TRANSLATED_PAGES). */
export const HEAD_SWAP_LANGS = ["en", "pt-BR", "es", "de", "ja"] as const;
export type HeadSwapLang = (typeof HEAD_SWAP_LANGS)[number];

export interface HeadSwapCopy {
  title: string;
  keywords: string[];
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

export const HEAD_SWAP_COPY: Record<HeadSwapLang, HeadSwapCopy> = {
  en: {
    title: "AI Head Swap Online: Whole Head with Hair, Photo and Video",
    keywords: ["ai head swap", "head swap online", "head swap with hair", "whole head swap", "video head swap", "photo head swap", "free head swap"],
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
    keywords: ["troca de cabeça ia", "trocar cabeça online", "troca de cabeça com cabelo", "troca de cabeça em vídeo", "trocar cabeça em foto"],
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
  es: {
    title: "Cambio de cabeza con IA online: cabeza y pelo, en foto y vídeo",
    keywords: ["cambio de cabeza ia", "cambiar cabeza online", "cambiar cabeza en foto", "cambiar cabeza en video", "cambiar cabeza y pelo", "poner mi cabeza en otro cuerpo", "head swap"],
    description: `Cambia la cabeza entera (cara, pelo y forma) en fotos o vídeos, desde el navegador: ${HEADSWAP_PRO_NAME} para fotos, Headswap Best y Fast para vídeo. Gratis con ${SIGNUP_GRANT_CREDITS} créditos, en resolución original o 1080p/4K.`,
    h1: "Cambio de cabeza con IA online: toda la cabeza, pelo incluido, en fotos y vídeos",
    answer: `Un cambio de cabeza sustituye la cabeza entera de una persona (cara, pelo y forma de la cabeza) por la de una foto de referencia, mientras que el cuerpo, la ropa, el fondo y las demás personas siguen igual. Un cambio de cara solo sustituye la cara y conserva el pelo original. NanoPocket ofrece el cambio de cabeza en el navegador, tanto para fotos (${HEADSWAP_PRO_NAME} y el modo cabeza de ${FACE_STUDIO_NAME}) como para vídeo (Headswap Best y Headswap Fast en ${FACESTUDIO_V_NAME}). Todos usan modelos de difusión. Una cuenta nueva recibe ${SIGNUP_GRANT_CREDITS} créditos gratis, suficientes para ${PRO_FREE} cambios de cabeza en foto con la resolución original o un cambio de cabeza en vídeo de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos en 1080p o 4K.`,
    cta: "Prueba gratis un cambio de cabeza",
    toolsHeading: "Qué herramienta usar para cada cambio de cabeza",
    toolHead: { tool: "Herramienta", bestFor: "Ideal para", price: "Créditos y límites", output: "Resultado" },
    tools: [
      {
        name: HEADSWAP_PRO_NAME,
        href: "/headswap-pro",
        kind: "Foto",
        bestFor: "Una cabeza en un retrato o una foto de grupo: haz clic en la persona que quieres cambiar",
        price: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} créditos por imagen, hasta ${HEADSWAP_PRO_MAX_VARIATIONS} variaciones por generación; ${PRO_FREE} gratis con los créditos de registro`,
        output: "La resolución original de la foto",
      },
      {
        name: `${FACE_STUDIO_NAME} (modo cabeza)`,
        href: "/face-studio",
        kind: "Foto",
        bestFor: `Fotos de grupo: hasta ${FACESTUDIO_MAX_FACES} caras en una sola generación, con modo de cabeza entera`,
        price: `${HEAD_SWAP_CREDITS} créditos por cabeza`,
        output: `Resolución original, hasta ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        name: "Headswap Best",
        href: "/video-head-swap",
        kind: "Vídeo",
        bestFor: "La máxima calidad en un clip corto",
        price: `Clip de 5 s: 149 créditos; 10 s: 218; hasta ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s por ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} créditos en una cuenta gratuita); unos 81 a 95 s por cada 100 fotogramas`,
        output: "1080p o 4K, con el sonido original",
      },
      {
        name: "Headswap Fast",
        href: "/video-head-swap",
        kind: "Vídeo",
        bestFor: "Una primera prueba con un clip nuevo: alrededor de un 40% más rápido y con un 35% menos de créditos",
        price: `Clip de 5 s: 102 créditos; 10 s: 143; hasta ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s por ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} créditos en una cuenta gratuita); unos 42 a 60 s por cada 100 fotogramas`,
        output: "1080p o 4K, con el sonido original",
      },
    ],
    vsHeading: "¿Cambio de cabeza o cambio de cara?",
    vs: [
      { term: "Cambio de cabeza", text: "Importan el pelo y la forma de la cabeza, o quieres un aspecto completamente nuevo. La cabeza nueva se recrea para que encaje con la pose, la luz y el tono de piel de la imagen original." },
      { term: "Cambio de cara", text: "Quieres otra cara, pero con el mismo pelo, la misma expresión y el mismo aspecto. Es más rápido y admite vídeos de hasta 60 segundos." },
    ],
    howHeading: "Cómo hacer un cambio de cabeza online",
    steps: [
      "Crea una cuenta gratuita de NanoPocket (con tu correo electrónico, sin tarjeta).",
      `Para una foto, abre ${HEADSWAP_PRO_NAME}; para un vídeo, abre ${FACESTUDIO_V_NAME} y elige Headswap Best o Headswap Fast.`,
      "Sube la foto o el vídeo y después una foto nítida y de frente de la nueva cabeza.",
      "En una foto de grupo o un vídeo con varias personas, elige a quién quieres cambiar. El precio se muestra antes de empezar y los trabajos fallidos no cuestan nada.",
    ],
    tipsHeading: "Consejos para un resultado natural",
    tips: [
      "Usa una foto de referencia nítida y de frente en la que se vean la cabeza y el pelo completos.",
      "Una referencia con un ángulo de cabeza y una iluminación parecidos se integra mejor.",
      "La cabeza que vas a cambiar debe verse bien y a buen tamaño, sin manos ni objetos que la tapen.",
      "Con contraluz fuerte o destellos de lente, el cambio de cabeza en vídeo puede perder el seguimiento de la cabeza por un instante.",
    ],
    diffusionHeading: "Por qué el cambio de cabeza usa difusión",
    diffusion: "Una herramienta típica de cambio de cara (una GAN) pega encima solo la zona interna de una cara nueva y conserva el pelo y el contorno originales; por eso algunos resultados parecen una máscara. Un modelo de difusión recrea la cabeza entera con la pose y la luz del original, así que el pelo, el nacimiento del pelo y la forma de la cabeza también pueden cambiar.",
    faqHeading: "Preguntas",
    faq: [
      {
        q: "¿Qué es un cambio de cabeza con IA?",
        a: "Un cambio de cabeza con IA sustituye la cabeza entera de una persona en una foto o un vídeo (cara, pelo y forma de la cabeza) por la de una foto de referencia. El cuerpo, la ropa, el fondo y las demás personas no cambian. Un cambio de cara solo sustituye la cara.",
      },
      {
        q: "¿Dónde puedo cambiar la cabeza online, pelo incluido?",
        a: `En nanopocket.ai, desde el navegador: ${HEADSWAP_PRO_NAME} para fotos, el modo cabeza de ${FACE_STUDIO_NAME} para varias personas en una foto, y Headswap Best o Headswap Fast en ${FACESTUDIO_V_NAME} para vídeo. Todos cambian el pelo y la forma de la cabeza, no solo la cara.`,
      },
      {
        q: "¿Puedo probar el cambio de cabeza gratis? ¿Con qué calidad?",
        a: `Sí. Una cuenta nueva recibe ${SIGNUP_GRANT_CREDITS} créditos gratis, sin tarjeta: suficientes para ${PRO_FREE} cambios de cabeza en foto con la resolución original, o un cambio de cabeza en vídeo de ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} créditos con Headswap Fast, ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} con Headswap Best) en 1080p, o en 4K con Headswap Fast. Los resultados gratuitos llevan una marca de agua de NanoPocket hasta la primera recarga.`,
      },
      {
        q: "¿Puedo cambiar una cabeza en una foto de grupo?",
        a: `Sí. ${HEADSWAP_PRO_NAME} encuentra a todas las personas de la foto y haces clic en la que quieres cambiar; solo cambia esa cabeza. Para cambiar varias caras en una sola generación, ${FACE_STUDIO_NAME} admite hasta ${FACESTUDIO_MAX_FACES} caras en una foto, cada una con su propia referencia.`,
      },
      {
        q: "¿Cuánto puede durar un cambio de cabeza en vídeo?",
        a: `Hasta ${VIDEO_HEAD_SWAP_MAX_SECONDS} segundos si tu cuenta ya ha hecho alguna recarga, y ${FREE_VIDEO_HEAD_SWAP_SECONDS} segundos si todavía no. Para vídeos más largos, el cambio de cara en vídeo llega hasta 60 segundos y mantiene el pelo original.`,
      },
      {
        q: "¿Es un modelo de difusión o una GAN?",
        a: "Todos los cambios de cabeza de NanoPocket, en foto y en vídeo, usan modelos de difusión. Eso es lo que permite volver a dibujar el pelo y la forma de la cabeza en lugar de pegar solo la zona interna de la cara.",
      },
    ],
    consent: "Usa una cara solo si tienes derecho a usarla. El estudio de vídeo te pide que lo confirmes antes de procesar un vídeo.",
    more: "Más información (en inglés): comparativa de los modos de cambio de cabeza en vídeo en /video-head-swap y, en el blog, un artículo sobre el cambio de cabeza por difusión y en qué se diferencia de una GAN.",
  },
  de: {
    title: "KI-Kopftausch online: ganzer Kopf mit Haaren, Foto und Video",
    keywords: ["ki kopftausch", "kopf tauschen online", "kopf austauschen foto", "kopf tauschen mit haaren", "kopftausch video", "head swap online", "head swap kostenlos"],
    description: `Tausche den ganzen Kopf samt Gesicht, Haaren und Kopfform in Foto oder Video, direkt im Browser. ${HEADSWAP_PRO_NAME} für Fotos, Headswap Best und Fast für Videos. Gratis testen mit ${SIGNUP_GRANT_CREDITS} Credits, in Originalauflösung oder 1080p/4K.`,
    h1: "KI-Kopftausch online: der ganze Kopf samt Haaren, in Fotos und Videos",
    answer: `Ein Kopftausch ersetzt den ganzen Kopf einer Person (Gesicht, Haare und Kopfform) durch den Kopf aus einem Referenzfoto, während Körper, Kleidung, Hintergrund und alle anderen Personen so bleiben, wie sie waren. Ein Face Swap ändert nur das Gesicht; die Originalhaare bleiben erhalten. NanoPocket bietet den Kopftausch im Browser für Fotos (${HEADSWAP_PRO_NAME} und der Kopfmodus von ${FACE_STUDIO_NAME}) und für Videos (Headswap Best und Headswap Fast in ${FACESTUDIO_V_NAME}). Alle basieren auf Diffusionsmodellen. Ein neues Konto erhält ${SIGNUP_GRANT_CREDITS} Gratis-Credits, genug für ${PRO_FREE} Foto-Kopftausche in Originalauflösung oder einen Video-Kopftausch von ${FREE_VIDEO_HEAD_SWAP_SECONDS} Sekunden in 1080p oder 4K.`,
    cta: "Kopftausch kostenlos testen",
    toolsHeading: "Welches Tool für welchen Kopftausch",
    toolHead: { tool: "Tool", bestFor: "Ideal für", price: "Credits und Limits", output: "Ergebnis" },
    tools: [
      {
        name: HEADSWAP_PRO_NAME,
        href: "/headswap-pro",
        kind: "Foto",
        bestFor: "Ein Kopf im Porträt oder Gruppenfoto: Klicke auf die Person, die du ändern willst",
        price: `${HEADSWAP_PRO_CREDITS_PER_IMAGE} Credits pro Bild, bis zu ${HEADSWAP_PRO_MAX_VARIATIONS} Varianten pro Durchgang; ${PRO_FREE} gratis mit den Credits zur Anmeldung`,
        output: "Die Originalauflösung des Fotos",
      },
      {
        name: `${FACE_STUDIO_NAME} (Kopfmodus)`,
        href: "/face-studio",
        kind: "Foto",
        bestFor: `Gruppenfotos: bis zu ${FACESTUDIO_MAX_FACES} Gesichter in einem Durchgang, mit Modus für den ganzen Kopf`,
        price: `${HEAD_SWAP_CREDITS} Credits pro Kopf`,
        output: `Originalauflösung, bis zu ${PHOTO_FACE_SWAP_MAX_SIZE}`,
      },
      {
        name: "Headswap Best",
        href: "/video-head-swap",
        kind: "Video",
        bestFor: "Höchste Qualität bei kurzen Clips",
        price: `5-s-Clip: 149 Credits, 10 s: 218; bis zu ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s für ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} Credits bei einem kostenlosen Konto); etwa 81 bis 95 s pro 100 Frames`,
        output: "1080p oder 4K, Originalton bleibt erhalten",
      },
      {
        name: "Headswap Fast",
        href: "/video-head-swap",
        kind: "Video",
        bestFor: "Erster Testlauf mit einem neuen Clip: etwa 40 % schneller, etwa 35 % weniger Credits",
        price: `5-s-Clip: 102 Credits, 10 s: 143; bis zu ${VIDEO_HEAD_SWAP_MAX_SECONDS} s (${FREE_VIDEO_HEAD_SWAP_SECONDS} s für ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} Credits bei einem kostenlosen Konto); etwa 42 bis 60 s pro 100 Frames`,
        output: "1080p oder 4K, Originalton bleibt erhalten",
      },
    ],
    vsHeading: "Kopftausch oder Face Swap?",
    vs: [
      { term: "Kopftausch", text: "Haare und Kopfform sind dir wichtig, oder du willst einen völlig neuen Look. Der neue Kopf wird so neu gezeichnet, dass er zu Pose, Licht und Hautton des Originals passt." },
      { term: "Face Swap", text: "Du willst ein anderes Gesicht, aber dieselben Haare, denselben Ausdruck und denselben Look. Ein Face Swap ist schneller und verarbeitet Videos mit bis zu 60 Sekunden." },
    ],
    howHeading: "So machst du einen Kopftausch online",
    steps: [
      "Erstelle ein kostenloses NanoPocket-Konto (per E-Mail, ohne Kreditkarte).",
      `Öffne für ein Foto ${HEADSWAP_PRO_NAME}, für ein Video ${FACESTUDIO_V_NAME} und wähle dort Headswap Best oder Headswap Fast.`,
      "Lade das Foto oder Video hoch, danach ein scharfes Frontalfoto des neuen Kopfes.",
      "Wähle in einem Gruppenfoto oder einem Video mit mehreren Personen aus, wen du ändern willst. Der Preis wird vor dem Start angezeigt, und ein fehlgeschlagener Auftrag kostet nichts.",
    ],
    tipsHeading: "Tipps für ein natürliches Ergebnis",
    tips: [
      "Nimm ein scharfes, frontales Referenzfoto, auf dem der ganze Kopf mit Haaren zu sehen ist.",
      "Eine Referenz mit ähnlichem Kopfwinkel und ähnlichem Licht fügt sich am besten ein.",
      "Der zu ersetzende Kopf sollte groß genug und gut erkennbar sein und nicht von Händen oder Gegenständen verdeckt werden.",
      "Bei starkem Gegenlicht oder Lens Flares kann ein Kopftausch im Video den Kopf für einen Moment verlieren.",
    ],
    diffusionHeading: "Warum der Kopftausch auf Diffusion setzt",
    diffusion: "Ein typischer Face-Swapper (ein GAN) klebt einen neuen inneren Gesichtsbereich ein und behält die Originalhaare und die Kopfkontur bei; deshalb wirken manche Swaps wie eine Maske. Ein Diffusionsmodell zeichnet den ganzen Kopf in der Pose und im Licht des Originals neu, sodass sich auch Haare, Haaransatz und Kopfform ändern können.",
    faqHeading: "Häufige Fragen",
    faq: [
      {
        q: "Was ist ein KI-Kopftausch?",
        a: "Ein KI-Kopftausch ersetzt den ganzen Kopf einer Person in einem Foto oder Video, also Gesicht, Haare und Kopfform, durch den Kopf aus einem Referenzfoto. Körper, Kleidung, Hintergrund und andere Personen bleiben unverändert. Ein Face Swap ändert nur das Gesicht.",
      },
      {
        q: "Wo kann ich online einen Kopftausch mit Haaren machen?",
        a: `Auf nanopocket.ai, im Browser: ${HEADSWAP_PRO_NAME} für Fotos, der Kopfmodus von ${FACE_STUDIO_NAME} für mehrere Personen auf einem Foto und Headswap Best oder Headswap Fast in ${FACESTUDIO_V_NAME} für Videos. Alle ersetzen auch Haare und Kopfform, nicht nur das Gesicht.`,
      },
      {
        q: "Kann ich einen Kopftausch kostenlos testen, und in welcher Qualität?",
        a: `Ja. Ein neues Konto erhält ${SIGNUP_GRANT_CREDITS} Gratis-Credits, ohne Karte: genug für ${PRO_FREE} Foto-Kopftausche in Originalauflösung oder einen Video-Kopftausch von ${FREE_VIDEO_HEAD_SWAP_SECONDS} Sekunden (${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} Credits mit Headswap Fast, ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} mit Headswap Best) in 1080p oder, mit Headswap Fast, in 4K. Gratis-Ergebnisse tragen bis zur ersten Aufladung ein NanoPocket-Wasserzeichen.`,
      },
      {
        q: "Kann ich in einem Gruppenfoto einen Kopf tauschen?",
        a: `Ja. ${HEADSWAP_PRO_NAME} findet alle Personen auf dem Foto, und du klickst auf die Person, die du ändern willst; nur dieser Kopf ändert sich. Um mehrere Gesichter in einem Durchgang zu ändern, verarbeitet ${FACE_STUDIO_NAME} bis zu ${FACESTUDIO_MAX_FACES} Gesichter pro Foto, jedes mit eigener Referenz.`,
      },
      {
        q: "Wie lang darf ein Kopftausch im Video sein?",
        a: `Bis zu ${VIDEO_HEAD_SWAP_MAX_SECONDS} Sekunden bei einem Konto, das schon einmal Credits aufgeladen hat, sonst ${FREE_VIDEO_HEAD_SWAP_SECONDS} Sekunden. Für längere Videos gibt es den Video-Face-Swap: bis zu 60 Sekunden, die Originalhaare bleiben erhalten.`,
      },
      {
        q: "Ist es ein Diffusionsmodell oder ein GAN?",
        a: "Jeder Kopftausch bei NanoPocket, ob Foto oder Video, läuft mit einem Diffusionsmodell. Genau dadurch lassen sich Haare und Kopfform neu zeichnen, statt nur einen inneren Gesichtsbereich einzukleben.",
      },
    ],
    consent: "Verwende ein Gesicht nur, wenn du das Recht dazu hast. Im Videostudio bestätigst du das vor jedem Videostart.",
    more: "Mehr Details (auf Englisch): ein Vergleich der Modi für den Video-Kopftausch auf /video-head-swap und der Unterschied zwischen Diffusion und GAN im Blogartikel zum Kopftausch per Diffusion.",
  },
  ja: {
    title: "オンライン AI ヘッドスワップ：髪ごと頭を入れ替え（写真・動画）",
    keywords: ["ヘッドスワップ", "AI ヘッドスワップ", "ヘッドスワップ 無料", "ヘッドスワップ 動画", "頭 入れ替え AI", "髪型ごと 顔入れ替え", "頭 すげ替え 画像"],
    description: `顔・髪型・頭の形まで、頭をまるごと入れ替え。写真も動画もブラウザだけで。写真は ${HEADSWAP_PRO_NAME}、動画は Headswap Best と Fast。登録でもらえる ${SIGNUP_GRANT_CREDITS} クレジットで、写真は元の解像度、動画は 1080p/4K で無料で試せます。`,
    h1: "ブラウザでできる AI ヘッドスワップ：髪型ごと頭全体を入れ替え、写真にも動画にも対応",
    answer: `ヘッドスワップは、人物の頭全体（顔・髪型・頭の形）を参照写真の頭に入れ替える処理です。体や服、背景、ほかの人物はそのまま残ります。顔入れ替え（フェイススワップ）は顔だけを変え、元の髪型は残します。NanoPocket では、写真のヘッドスワップ（${HEADSWAP_PRO_NAME} と ${FACE_STUDIO_NAME} のヘッドモード）と動画のヘッドスワップ（${FACESTUDIO_V_NAME} の Headswap Best と Headswap Fast）をブラウザで行えます。いずれも拡散モデルを使っています。新規アカウントには ${SIGNUP_GRANT_CREDITS} クレジットが無料で付き、写真のヘッドスワップなら元の解像度で ${PRO_FREE} 回、動画なら ${FREE_VIDEO_HEAD_SWAP_SECONDS} 秒のヘッドスワップを 1080p または 4K で試せます。`,
    cta: "ヘッドスワップを無料で試す",
    toolsHeading: "目的別のヘッドスワップツール",
    toolHead: { tool: "ツール", bestFor: "向いている用途", price: "クレジットと制限", output: "出力" },
    tools: [
      {
        name: HEADSWAP_PRO_NAME,
        href: "/headswap-pro",
        kind: "写真",
        bestFor: "ポートレートや集合写真の一人だけを入れ替え（対象の人をクリック）",
        price: `1枚 ${HEADSWAP_PRO_CREDITS_PER_IMAGE} クレジット、1回で最大 ${HEADSWAP_PRO_MAX_VARIATIONS} パターン。登録時のクレジットで ${PRO_FREE} 枚無料`,
        output: "元の写真の解像度のまま",
      },
      {
        name: `${FACE_STUDIO_NAME}（ヘッドモード）`,
        href: "/face-studio",
        kind: "写真",
        bestFor: `集合写真：1回の生成で最大 ${FACESTUDIO_MAX_FACES} 人まで、頭全体を入れ替えるモードあり`,
        price: `頭1つにつき ${HEAD_SWAP_CREDITS} クレジット`,
        output: `元の解像度（最大 ${PHOTO_FACE_SWAP_MAX_SIZE}）`,
      },
      {
        name: "Headswap Best",
        href: "/video-head-swap",
        kind: "動画",
        bestFor: "短いクリップを最高画質で",
        price: `5 秒のクリップで 149 クレジット、10 秒で 218 クレジット。最長 ${VIDEO_HEAD_SWAP_MAX_SECONDS} 秒（無料アカウントは ${FREE_VIDEO_HEAD_SWAP_SECONDS} 秒・${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} クレジット）。処理時間は 100 フレームあたり約 81〜95 秒`,
        output: "1080p または 4K、元の音声はそのまま",
      },
      {
        name: "Headswap Fast",
        href: "/video-head-swap",
        kind: "動画",
        bestFor: "新しいクリップの最初のお試しに：処理は約 40% 速く、クレジットは約 35% 少なめ",
        price: `5 秒のクリップで 102 クレジット、10 秒で 143 クレジット。最長 ${VIDEO_HEAD_SWAP_MAX_SECONDS} 秒（無料アカウントは ${FREE_VIDEO_HEAD_SWAP_SECONDS} 秒・${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} クレジット）。処理時間は 100 フレームあたり約 42〜60 秒`,
        output: "1080p または 4K、元の音声はそのまま",
      },
    ],
    vsHeading: "ヘッドスワップと顔入れ替え、どちらを使う？",
    vs: [
      { term: "ヘッドスワップ", text: "髪型や頭の形も変えたいとき、まったく新しい見た目にしたいとき。新しい頭は、元の写真や動画のポーズ・照明・肌の色味に合わせて描き直されます。" },
      { term: "顔入れ替え", text: "顔だけ変えて、髪型・表情・雰囲気はそのままにしたいとき。処理が速く、動画は最長 60 秒まで対応します。" },
    ],
    howHeading: "オンラインでヘッドスワップする手順",
    steps: [
      "NanoPocket の無料アカウントを作成します（メールアドレスのみ、カード不要）。",
      `写真なら ${HEADSWAP_PRO_NAME} を、動画なら ${FACESTUDIO_V_NAME} を開いて Headswap Best か Headswap Fast を選びます。`,
      "元の写真または動画をアップロードし、続いて新しい頭の、正面を向いた鮮明な写真を追加します。",
      "集合写真や複数人が映る動画では、入れ替える人を選びます。必要なクレジットは開始前に表示され、失敗した処理にはクレジットはかかりません。",
    ],
    tipsHeading: "自然に仕上げるコツ",
    tips: [
      "頭全体と髪がはっきり写った、鮮明な正面の参照写真を使いましょう。",
      "頭の角度や光の当たり方が近い参照写真ほど、なじみやすくなります。",
      "入れ替える頭は大きくはっきり写っていて、手や小物で隠れていないことが大切です。",
      "強い逆光やレンズフレアがあると、動画のヘッドスワップで頭の追跡が一瞬途切れることがあります。",
    ],
    diffusionHeading: "ヘッドスワップに拡散モデルを使う理由",
    diffusion: "一般的な顔入れ替えツール（GAN）は顔の内側だけを貼り替え、元の髪型や輪郭を残すため、仮面をかぶったように見えることがあります。拡散モデルは元のポーズと照明に合わせて頭全体を描き直すので、髪型や生え際、頭の形まで変えられます。",
    faqHeading: "よくある質問",
    faq: [
      {
        q: "AI ヘッドスワップとは？",
        a: "写真や動画に写る人物の頭全体（顔・髪型・頭の形）を、参照写真の頭に入れ替える処理です。体、服、背景、ほかの人はそのまま残ります。顔入れ替えが変えるのは顔だけです。",
      },
      {
        q: "髪ごと頭を入れ替えられるオンラインツールは？",
        a: `nanopocket.ai ならブラウザで使えます。写真は ${HEADSWAP_PRO_NAME}、1枚の写真で複数人を入れ替えるなら ${FACE_STUDIO_NAME} のヘッドモード、動画は ${FACESTUDIO_V_NAME} の Headswap Best か Headswap Fast。どれも顔だけでなく髪型と頭の形まで入れ替えます。`,
      },
      {
        q: "無料で試せますか？品質は？",
        a: `はい。新規アカウントにはカード登録なしで ${SIGNUP_GRANT_CREDITS} クレジットが無料で付きます。写真のヘッドスワップなら元の解像度で ${PRO_FREE} 回、動画なら ${FREE_VIDEO_HEAD_SWAP_SECONDS} 秒のヘッドスワップ（Headswap Fast で ${FREE_VIDEO_HEAD_SWAP_FAST_CREDITS} クレジット、Headswap Best で ${FREE_VIDEO_HEAD_SWAP_BEST_CREDITS} クレジット）を 1080p で、Headswap Fast なら 4K でも試せます。無料の結果には、最初のチャージまで NanoPocket の透かしが入ります。`,
      },
      {
        q: "集合写真の中の一人だけ頭を入れ替えられますか？",
        a: `はい。${HEADSWAP_PRO_NAME} が写真に写る全員を検出するので、入れ替えたい人をクリックするだけです。変わるのはその人の頭だけです。複数の顔を1回で変えたいときは、${FACE_STUDIO_NAME} なら1枚の写真で最大 ${FACESTUDIO_MAX_FACES} 人まで、それぞれ別の参照写真で入れ替えられます。`,
      },
      {
        q: "動画のヘッドスワップは何秒までできますか？",
        a: `一度でもクレジットをチャージしたアカウントなら最長 ${VIDEO_HEAD_SWAP_MAX_SECONDS} 秒、未チャージのアカウントは ${FREE_VIDEO_HEAD_SWAP_SECONDS} 秒までです。それより長い動画には、最長 60 秒まで対応する動画の顔入れ替えが使えます（元の髪型はそのまま残ります）。`,
      },
      {
        q: "拡散モデルですか、GAN ですか？",
        a: "NanoPocket のヘッドスワップは、写真も動画もすべて拡散モデルです。だからこそ、顔の内側を貼り付けるのではなく、髪型や頭の形まで描き直せます。",
      },
    ],
    consent: "顔は、使用する権利がある場合にのみ使ってください。動画スタジオでは、処理を始める前にこの点の確認をお願いしています。",
    more: "さらに詳しく（英語）：動画ヘッドスワップの各モードの比較は /video-head-swap で、拡散モデルと GAN の違いは、拡散モデルによるヘッドスワップに関するブログ記事でご覧いただけます。",
  },
};
