import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Words for the skin-texture test (/data/face-swap-skin-test in English, /pt-BR/data/face-swap-skin-test in Portuguese).
 * The numbers and file names are in ./skin-test-page.tsx, once for both languages. Tool and product names are not translated.
 */

export type SkinTestLocale = "en" | "pt-BR";
export const SKIN_TEST_LOCALES: readonly SkinTestLocale[] = ["en", "pt-BR"];

const S = ({ children }: { children: ReactNode }) => <strong className="text-foreground">{children}</strong>;
const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="text-primary hover:underline">
    {children}
  </Link>
);

export interface SkinTestCopy {
  title: string;
  description: string;
  keywords: string[];
  ogAlt: string;
  byline: (date: string) => string;
  shortAnswerH: string;
  shortAnswer: ReactNode;
  setupH: string;
  setupPhotos: ReactNode;
  tools: Record<string, { name: string; detail: string }>;
  setupVideo: ReactNode;
  setupHeadVsFace: string;
  photoH: string;
  photoIntro: string;
  pairLabels: string[];
  photoBefore: string;
  newFace: string;
  fullSize: string;
  closeup: string;
  thSkin: string;
  thLeft: string;
  thRight: string;
  thForehead: string;
  thAverage: string;
  photoBeforeRow: string;
  videoH: string;
  videoIntro: string;
  clipLabels: string[];
  videoNames: { original: string; neo: string; magichour_free: string };
  frameCaption: string;
  newFaceAi: string;
  thSkinFrames: (n: number) => string;
  rowOriginal: string;
  rowNeo: string;
  rowMagicHour: string;
  whyH: string;
  why: ReactNode[];
  limitsH: string;
  limits: ReactNode[];
  ctaHeadSwap: string;
  ctaNeo: string;
  ctaStats: string;
  hrefHeadSwap: string;
  hrefVideo: string;
}

const en: SkinTestCopy = {
  title: "Face Swap Skin Test: Which AI Keeps Real Skin Texture?",
  description:
    "We ran the same AI-generated faces and stock clips through Nano HeadSwap Pro, Neo, FaceFusion, roop and Magic Hour's free tools, then measured how much fine skin detail each result kept. Full-size outputs, method and limits included.",
  keywords: [
    "realistic face swap",
    "face swap plastic skin",
    "face swap skin texture",
    "most realistic AI head swap",
    "FaceFusion vs",
    "inswapper GFPGAN smooth skin",
    "diffusion face swap",
  ],
  ogAlt: "Nano HeadSwap Pro result with forehead wrinkles and pores",
  byline: (d) => `Tested ${d} · by NanoPocket, the maker of two of the tools tested`,
  shortAnswerH: "Short answer",
  shortAnswer: (
    <>
      On the same inputs, <S>Nano HeadSwap Pro</S> kept two to seven times more fine skin detail than FaceFusion and roop,
      and carried the new person&apos;s wrinkles, age spots and freckles into the photo. In video, <S>Neo</S> (Best quality
      in Video FaceSwap Online) kept about as much skin detail as the original clip, at 1080p. Magic Hour&apos;s free,
      no-sign-up tools returned 640-pixel-wide results, soft when viewed at the same size. Both NanoPocket models are
      diffusion models: they draw the face again at full resolution instead of pasting a small generated face and sharpening
      it.
    </>
  ),
  setupH: "What we ran",
  setupPhotos: (
    <>
      <S>Photos.</S> Three pairs of AI-generated studio portraits (2816×1536, made with Google Gemini; no real person). Each
      tool got the same photo and the same new face, default settings, one run.
    </>
  ),
  tools: {
    headswap_pro: { name: "Nano HeadSwap Pro", detail: "Ours. Diffusion head swap, 1 variation, default settings." },
    facefusion_hyperswap1b: {
      name: "FaceFusion 3.3.2, HyperSwap 1b 256",
      detail: "Open source. Community Hugging Face Space V0pr0S/FaceFusion-Face-Swap-Hyperswap, its recommended model, no face enhancer.",
    },
    roop_inswapper128_gfpgan: {
      name: "roop (inswapper_128 + GFPGAN)",
      detail: "Open source, the classic pipeline. Community Space aiguruji97/facefusion, “Enhance face quality with GFPGAN” on.",
    },
    magichour_free: {
      name: "Magic Hour, free head swap",
      detail: "No sign-up tier. Returned a 640×344 image; Magic Hour says signing up gives higher-resolution outputs.",
    },
  },
  setupVideo: (
    <>
      <S>Video.</S> Two 4-second 1280×720 clips of free stock footage (the clips on our video page) with an AI-generated face
      as the new face: <S>Neo</S> at 1080p in <A href="/facestudio-v">Video FaceSwap Online</A> against Magic Hour&apos;s free
      video face swap (640×360, with a Magic Hour watermark).
    </>
  ),
  setupHeadVsFace:
    "HeadSwap Pro replaces the whole head; FaceFusion and roop replace the inner face and keep the original hair and head shape. Skin detail is compared on the cheeks and forehead, which every tool redraws.",
  photoH: "Photo results",
  photoIntro:
    "Skin detail = how much fine texture (pores, stubble, fine lines) is left, measured on the left cheek, right cheek and forehead after scaling every image to 2080 pixels wide. Higher is more detail. The photo before the swap is shown for reference.",
  pairLabels: [
    "Pair 1: smooth young face, new head with stubble",
    "Pair 2: new head with deep wrinkles and age spots",
    "Pair 3: new head with freckles",
  ],
  photoBefore: "Photo before",
  newFace: "New face",
  fullSize: "full size",
  closeup: "Cheek close-up, same area and size for every result:",
  thSkin: "Skin detail",
  thLeft: "Left cheek",
  thRight: "Right cheek",
  thForehead: "Forehead",
  thAverage: "Average",
  photoBeforeRow: "Photo before (reference)",
  videoH: "Video results",
  videoIntro:
    "Skin detail averaged over every 8th frame, on the face area scaled to the same size for each video. Video is compressed, so the numbers are lower than for photos; compare them within a clip.",
  clipLabels: ["Clip 1: smiling man, indoors", "Clip 2: smiling woman, shallow focus"],
  videoNames: { original: "Original clip (1280×720)", neo: "Neo, NanoPocket (1080p)", magichour_free: "Magic Hour free (640×360)" },
  frameCaption: "Frame 48, face area at the same size: original, Neo, Magic Hour free",
  newFaceAi: "New face (AI-generated)",
  thSkinFrames: (n) => `Skin detail (${n} frames)`,
  rowOriginal: "Original clip",
  rowNeo: "Neo (NanoPocket)",
  rowMagicHour: "Magic Hour free",
  whyH: "Why many face swaps look plastic",
  why: [
    <>
      The classic open-source swapper, <S>inswapper_128</S> (used by roop and as an option in FaceFusion), generates the new
      face at 128×128 pixels. That face is enlarged to fit the photo and usually passed through a face restorer such as GFPGAN
      or GPEN to look sharp again. A restorer invents a clean, even skin instead of the person&apos;s real pores and lines,
      which is the smooth, airbrushed look in the roop column above. Newer swappers such as HyperSwap work at 256×256:
      better, but on a face that fills a large photo, most of the fine texture is still gone.
    </>,
    <>
      Diffusion models work differently: they draw the face, or the whole head, again at the resolution of the photo, guided
      by the new person&apos;s photo. Texture such as pores, stubble, wrinkles and freckles is drawn as part of the face, not
      added afterwards. Nano HeadSwap Pro and the Neo, Headswap Fast and Headswap Best video modes are diffusion models. More
      background: <A href="/blog/diffusion-head-swap-vs-gan-face-swap">Diffusion Head Swap vs GAN Face Swap</A>.
    </>,
  ],
  limitsH: "Method and limits",
  limits: [
    <>
      <S>The measure.</S> On a fixed patch of each cheek and the forehead, we take the standard deviation of the Laplacian of
      the brightness (a common sharpness measure), after scaling every image to the same width with Lanczos resampling. It
      counts fine texture, so it rewards real pores and stubble, and also noise; that is why the close-ups are shown next to
      the numbers. It does not measure how much the result looks like the new person.
    </>,
    <>
      <S>Small test.</S> Three front-facing studio portraits and two short, well-lit clips, one run each. Hard angles, low
      light, hands in front of the face and long videos were not part of this test.
    </>,
    <>
      <S>Free tiers.</S> Magic Hour was tested without an account, as most people try it; its paid plans may give larger
      outputs. FaceFusion and roop were run in community Hugging Face Spaces with the settings each Space recommends;
      installed locally with other settings they can look different.
    </>,
    <>
      <S>Not neutral.</S> We make HeadSwap Pro and Neo. Every photo input and output is linked at full size (WebP at quality
      92; the numbers were measured on the original downloads), and the videos are the files each tool returned, so the
      comparison can be checked or repeated.
    </>,
  ],
  ctaHeadSwap: "Try Nano HeadSwap Pro",
  ctaNeo: "Try Neo in Video FaceSwap Online",
  ctaStats: "Live job statistics",
  hrefHeadSwap: "/headswap-pro",
  hrefVideo: "/facestudio-v",
};

const ptBR: SkinTestCopy = {
  title: "Teste de pele em troca de rosto: qual IA mantém a textura real da pele?",
  description:
    "Passamos os mesmos rostos gerados por IA e os mesmos clipes de banco de imagens pelo Nano HeadSwap Pro, pelo Neo, pelo FaceFusion, pelo roop e pelas ferramentas grátis da Magic Hour, e medimos quanto detalhe fino de pele cada resultado manteve. Arquivos em tamanho real, método e limites incluídos.",
  keywords: [
    "troca de rosto realista",
    "face swap realista",
    "face swap pele de plástico",
    "textura de pele face swap",
    "troca de cabeça com IA realista",
    "FaceFusion comparação",
    "face swap por difusão",
  ],
  ogAlt: "Resultado do Nano HeadSwap Pro com rugas na testa e poros",
  byline: (d) => `Testado em ${d} · pela NanoPocket, que faz duas das ferramentas testadas`,
  shortAnswerH: "Resposta curta",
  shortAnswer: (
    <>
      Com as mesmas entradas, o <S>Nano HeadSwap Pro</S> manteve de duas a sete vezes mais detalhe fino de pele que o
      FaceFusion e o roop, e levou para a foto as rugas, as manchas da idade e as sardas da nova pessoa. Em vídeo, o{" "}
      <S>Neo</S> (a Melhor qualidade do Video FaceSwap Online) manteve quase tanto detalhe de pele quanto o clipe original, em
      1080p. As ferramentas grátis e sem cadastro da Magic Hour entregaram resultados com 640 pixels de largura, borrados
      quando vistos no mesmo tamanho. Os dois modelos da NanoPocket são modelos de difusão: eles redesenham o rosto na
      resolução completa, em vez de colar um rosto pequeno gerado e depois aumentar a nitidez.
    </>
  ),
  setupH: "O que testamos",
  setupPhotos: (
    <>
      <S>Fotos.</S> Três pares de retratos de estúdio gerados por IA (2816×1536, feitos com o Google Gemini; nenhuma pessoa
      real). Cada ferramenta recebeu a mesma foto e o mesmo novo rosto, com os ajustes padrão, uma execução.
    </>
  ),
  tools: {
    headswap_pro: { name: "Nano HeadSwap Pro", detail: "Nosso. Troca de cabeça por difusão, 1 variação, ajustes padrão." },
    facefusion_hyperswap1b: {
      name: "FaceFusion 3.3.2, HyperSwap 1b 256",
      detail: "Código aberto. Space comunitário do Hugging Face V0pr0S/FaceFusion-Face-Swap-Hyperswap, com o modelo que ele recomenda, sem melhorador de rosto.",
    },
    roop_inswapper128_gfpgan: {
      name: "roop (inswapper_128 + GFPGAN)",
      detail: "Código aberto, o pipeline clássico. Space comunitário aiguruji97/facefusion, com “Enhance face quality with GFPGAN” ligado.",
    },
    magichour_free: {
      name: "Magic Hour, troca de cabeça grátis",
      detail: "Sem cadastro. Entregou uma imagem de 640×344; a Magic Hour diz que quem se cadastra recebe resultados em resolução maior.",
    },
  },
  setupVideo: (
    <>
      <S>Vídeo.</S> Dois clipes de 4 segundos em 1280×720, de imagens de banco grátis (os clipes da nossa página de vídeo),
      com um rosto gerado por IA como novo rosto: o <S>Neo</S> em 1080p no{" "}
      <A href="/pt-BR/facestudio-v">Video FaceSwap Online</A> contra a troca de rosto em vídeo grátis da Magic Hour (640×360,
      com marca d&apos;água da Magic Hour).
    </>
  ),
  setupHeadVsFace:
    "O HeadSwap Pro troca a cabeça inteira; o FaceFusion e o roop trocam a parte interna do rosto e mantêm o cabelo e o formato da cabeça originais. O detalhe de pele é comparado nas bochechas e na testa, que todas as ferramentas redesenham.",
  photoH: "Resultados em foto",
  photoIntro:
    "Detalhe de pele = quanta textura fina (poros, barba por fazer, linhas finas) sobra, medida na bochecha esquerda, na bochecha direita e na testa depois de redimensionar cada imagem para 2080 pixels de largura. Quanto maior, mais detalhe. A foto antes da troca aparece como referência.",
  pairLabels: [
    "Par 1: rosto jovem e liso, nova cabeça com barba por fazer",
    "Par 2: nova cabeça com rugas profundas e manchas da idade",
    "Par 3: nova cabeça com sardas",
  ],
  photoBefore: "Foto antes",
  newFace: "Novo rosto",
  fullSize: "tamanho real",
  closeup: "Close da bochecha, mesma área e mesmo tamanho em todos os resultados:",
  thSkin: "Detalhe de pele",
  thLeft: "Bochecha esquerda",
  thRight: "Bochecha direita",
  thForehead: "Testa",
  thAverage: "Média",
  photoBeforeRow: "Foto antes (referência)",
  videoH: "Resultados em vídeo",
  videoIntro:
    "Detalhe de pele na média de um a cada 8 quadros, na área do rosto redimensionada para o mesmo tamanho em cada vídeo. Vídeo é comprimido, então os números são menores que nas fotos; compare dentro do mesmo clipe.",
  clipLabels: ["Clipe 1: homem sorrindo, em ambiente interno", "Clipe 2: mulher sorrindo, fundo desfocado"],
  videoNames: { original: "Clipe original (1280×720)", neo: "Neo, NanoPocket (1080p)", magichour_free: "Magic Hour grátis (640×360)" },
  frameCaption: "Quadro 48, área do rosto no mesmo tamanho: original, Neo, Magic Hour grátis",
  newFaceAi: "Novo rosto (gerado por IA)",
  thSkinFrames: (n) => `Detalhe de pele (${n} quadros)`,
  rowOriginal: "Clipe original",
  rowNeo: "Neo (NanoPocket)",
  rowMagicHour: "Magic Hour grátis",
  whyH: "Por que tantas trocas de rosto parecem de plástico",
  why: [
    <>
      O trocador clássico de código aberto, o <S>inswapper_128</S> (usado pelo roop e como opção no FaceFusion), gera o novo
      rosto com 128×128 pixels. Esse rosto é ampliado para caber na foto e quase sempre passa por um restaurador de rosto como
      o GFPGAN ou o GPEN para parecer nítido de novo. O restaurador inventa uma pele limpa e uniforme no lugar dos poros e
      das linhas reais da pessoa, e é daí que vem o aspecto liso, de aerógrafo, na coluna do roop acima. Trocadores mais novos,
      como o HyperSwap, trabalham em 256×256: melhor, mas num rosto que ocupa uma foto grande a maior parte da textura fina
      ainda se perde.
    </>,
    <>
      Modelos de difusão funcionam de outro jeito: redesenham o rosto, ou a cabeça inteira, na resolução da foto, guiados
      pela foto da nova pessoa. Poros, barba por fazer, rugas e sardas são desenhados como parte do rosto, e não acrescentados
      depois. O Nano HeadSwap Pro e os modos de vídeo Neo, Headswap Fast e Headswap Best são modelos de difusão. Mais
      contexto (em inglês): <A href="/blog/diffusion-head-swap-vs-gan-face-swap">Diffusion Head Swap vs GAN Face Swap</A>.
    </>,
  ],
  limitsH: "Método e limites",
  limits: [
    <>
      <S>A medida.</S> Num trecho fixo de cada bochecha e da testa, calculamos o desvio padrão do laplaciano do brilho (uma
      medida comum de nitidez), depois de redimensionar todas as imagens para a mesma largura com reamostragem Lanczos. Ela
      conta textura fina, então premia poros e barba reais, e também ruído; por isso os closes aparecem ao lado dos números.
      Ela não mede o quanto o resultado se parece com a nova pessoa.
    </>,
    <>
      <S>Teste pequeno.</S> Três retratos de estúdio de frente e dois clipes curtos e bem iluminados, uma execução cada.
      Ângulos difíceis, pouca luz, mãos na frente do rosto e vídeos longos não fizeram parte deste teste.
    </>,
    <>
      <S>Versões grátis.</S> A Magic Hour foi testada sem conta, do jeito que a maioria das pessoas experimenta; os planos
      pagos podem entregar resultados maiores. O FaceFusion e o roop rodaram em Spaces comunitários do Hugging Face com os
      ajustes que cada Space recomenda; instalados no computador, com outros ajustes, podem ficar diferentes.
    </>,
    <>
      <S>Não somos neutros.</S> Nós fazemos o HeadSwap Pro e o Neo. Cada foto de entrada e de saída tem link em tamanho real
      (WebP com qualidade 92; os números foram medidos nos arquivos originais baixados), e os vídeos são os arquivos que cada
      ferramenta entregou, para que a comparação possa ser conferida ou repetida.
    </>,
  ],
  ctaHeadSwap: "Experimentar o Nano HeadSwap Pro",
  ctaNeo: "Experimentar o Neo no Video FaceSwap Online",
  ctaStats: "Estatísticas de jobs ao vivo (em inglês)",
  hrefHeadSwap: "/pt-BR/headswap-pro",
  hrefVideo: "/pt-BR/facestudio-v",
};

export const SKIN_TEST_COPY: Record<SkinTestLocale, SkinTestCopy> = { en, "pt-BR": ptBR };
