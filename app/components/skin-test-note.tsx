import Link from "next/link";
import { Microscope } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/locales";

/**
 * One line that points from a product page to the skin-texture test (/data/face-swap-skin-test), with its headline
 * result for that product. The figures are the ones on the test page (2026-11-25); change both together.
 * The test is in English and Portuguese, so the other languages say the link is in English.
 */

type Kind = "headswap" | "neo";

const TEXT: Record<AppLocale, { headswap: string; neo: string; link: string }> = {
  en: {
    headswap: "Skin texture test: on the same faces, Nano HeadSwap Pro kept 2–7× more fine skin detail than FaceFusion and roop.",
    neo: "Skin texture test: Neo kept about as much skin detail as the original clip, at 1080p; Magic Hour's free video face swap returned 640×360.",
    link: "See the test",
  },
  "zh-CN": {
    headswap: "皮肤质感测试：同样的人脸，Nano HeadSwap Pro 保留的皮肤细节是 FaceFusion 和 roop 的 2–7 倍。",
    neo: "皮肤质感测试：Neo 以 1080p 输出，皮肤细节和原视频相当；Magic Hour 的免费视频换脸只输出 640×360。",
    link: "查看测试（英文）",
  },
  ja: {
    headswap: "肌の質感テスト：同じ顔で、Nano HeadSwap Pro は FaceFusion や roop の 2〜7 倍の細かな肌のディテールを残しました。",
    neo: "肌の質感テスト：Neo は 1080p で、元の動画とほぼ同じ肌のディテールを保ちました。Magic Hour の無料動画フェイススワップは 640×360 でした。",
    link: "テストを見る（英語）",
  },
  ko: {
    headswap: "피부 질감 테스트: 같은 얼굴로 Nano HeadSwap Pro는 FaceFusion과 roop보다 2~7배 많은 피부 디테일을 유지했습니다.",
    neo: "피부 질감 테스트: Neo는 1080p에서 원본 영상과 비슷한 피부 디테일을 유지했습니다. Magic Hour 무료 동영상 페이스 스왑은 640×360이었습니다.",
    link: "테스트 보기(영어)",
  },
  es: {
    headswap: "Prueba de textura de piel: con las mismas caras, Nano HeadSwap Pro conservó de 2 a 7 veces más detalle fino de piel que FaceFusion y roop.",
    neo: "Prueba de textura de piel: Neo conservó casi tanto detalle de piel como el clip original, en 1080p; el face swap de video gratis de Magic Hour devolvió 640×360.",
    link: "Ver la prueba (en inglés)",
  },
  "pt-BR": {
    headswap: "Teste de textura de pele: com os mesmos rostos, o Nano HeadSwap Pro manteve de 2 a 7 vezes mais detalhe fino de pele que o FaceFusion e o roop.",
    neo: "Teste de textura de pele: o Neo manteve quase tanto detalhe de pele quanto o clipe original, em 1080p; a troca de rosto em vídeo grátis da Magic Hour entregou 640×360.",
    link: "Ver o teste",
  },
  de: {
    headswap: "Hauttextur-Test: Bei denselben Gesichtern behielt Nano HeadSwap Pro 2- bis 7-mal mehr feine Hautdetails als FaceFusion und roop.",
    neo: "Hauttextur-Test: Neo behielt in 1080p etwa so viele Hautdetails wie der Originalclip; der kostenlose Video-Face-Swap von Magic Hour lieferte 640×360.",
    link: "Zum Test (auf Englisch)",
  },
  fr: {
    headswap: "Test de texture de peau : sur les mêmes visages, Nano HeadSwap Pro a conservé 2 à 7 fois plus de détails fins de peau que FaceFusion et roop.",
    neo: "Test de texture de peau : Neo a gardé à peu près autant de détails de peau que le clip d'origine, en 1080p ; le face swap vidéo gratuit de Magic Hour a rendu du 640×360.",
    link: "Voir le test (en anglais)",
  },
};

const hrefFor = (locale: AppLocale) => (locale === "pt-BR" ? "/pt-BR/data/face-swap-skin-test" : "/data/face-swap-skin-test");

export function SkinTestNote({ locale, kind, dark = false }: { locale: AppLocale; kind: Kind; dark?: boolean }) {
  const t = TEXT[locale] ?? TEXT.en;
  return (
    <p
      className={
        dark
          ? "mx-auto flex max-w-3xl items-start gap-2 text-sm leading-relaxed text-white/70"
          : "flex max-w-3xl items-start gap-2 text-sm leading-relaxed text-muted-foreground"
      }
    >
      <Microscope className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-white/60" : "text-primary"}`} aria-hidden="true" />
      <span>
        {t[kind]}{" "}
        <Link href={hrefFor(locale)} className={dark ? "font-medium text-white underline underline-offset-4" : "font-medium text-primary hover:underline"}>
          {t.link} →
        </Link>
      </span>
    </p>
  );
}
