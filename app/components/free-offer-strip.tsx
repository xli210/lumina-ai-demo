import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { SIGNUP_FREE_SWAPS } from "@/lib/face-studio-facts";
import { DAILY_FREE_FACE_SWAPS, FREE_PHOTO_MAX_SIDE } from "@/lib/facestudio-daily-free-rules";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";

/**
 * The free offer, said once near the top of the homepage (owner, 2026-11-25: "我感觉主页没有提到"):
 * the daily free photo face swap and the sign-up credits, with their numbers. A server component with no
 * per-user state, so the CDN-cached homepage stays cacheable; the link goes to the Face Studio page,
 * which signs a visitor up or opens the tool.
 */
const TEXT: Record<AppLocale, { label: string; daily: string; signup: string; note: string; cta: string }> = {
  en: {
    label: "Free",
    daily: `${DAILY_FREE_FACE_SWAPS} free photo face swap every day`,
    signup: `+ ${SIGNUP_GRANT_CREDITS} free credits for new accounts (${SIGNUP_FREE_SWAPS} more swaps)`,
    note: `No watermark on free photos: up to ${FREE_PHOTO_MAX_SIDE} px with a small corner mark. Email sign-up, no card.`,
    cta: "Swap a face free",
  },
  "zh-CN": {
    label: "免费",
    daily: `每天 ${DAILY_FREE_FACE_SWAPS} 次免费照片换脸`,
    signup: `+ 新账号送 ${SIGNUP_GRANT_CREDITS} 积分（再换 ${SIGNUP_FREE_SWAPS} 次）`,
    note: `免费照片没有水印：最高 ${FREE_PHOTO_MAX_SIDE} 像素，角落一个小标志。邮箱注册，无需绑卡。`,
    cta: "免费换一张脸",
  },
  ja: {
    label: "無料",
    daily: `毎日 ${DAILY_FREE_FACE_SWAPS} 回、写真の顔交換が無料`,
    signup: `+ 新規アカウントに ${SIGNUP_GRANT_CREDITS} クレジット（さらに ${SIGNUP_FREE_SWAPS} 回）`,
    note: `無料の写真に透かしなし：最大 ${FREE_PHOTO_MAX_SIDE} px、隅に小さなマーク。メールで登録、カード不要。`,
    cta: "無料で顔交換",
  },
  ko: {
    label: "무료",
    daily: `매일 ${DAILY_FREE_FACE_SWAPS}회 무료 사진 얼굴 교체`,
    signup: `+ 새 계정에 ${SIGNUP_GRANT_CREDITS} 크레딧 (${SIGNUP_FREE_SWAPS}회 더)`,
    note: `무료 사진에 워터마크 없음: 최대 ${FREE_PHOTO_MAX_SIDE}px, 모서리에 작은 표시. 이메일 가입, 카드 불필요.`,
    cta: "무료로 얼굴 바꾸기",
  },
  es: {
    label: "Gratis",
    daily: `${DAILY_FREE_FACE_SWAPS} cambio de cara en foto gratis cada día`,
    signup: `+ ${SIGNUP_GRANT_CREDITS} créditos gratis para cuentas nuevas (${SIGNUP_FREE_SWAPS} cambios más)`,
    note: `Sin marca de agua en las fotos gratis: hasta ${FREE_PHOTO_MAX_SIDE} px con una pequeña marca en la esquina. Registro con email, sin tarjeta.`,
    cta: "Cambia una cara gratis",
  },
  "pt-BR": {
    label: "Grátis",
    daily: `${DAILY_FREE_FACE_SWAPS} troca de rosto em foto grátis todo dia`,
    signup: `+ ${SIGNUP_GRANT_CREDITS} créditos grátis para contas novas (mais ${SIGNUP_FREE_SWAPS} trocas)`,
    note: `Sem marca d'água nas fotos grátis: até ${FREE_PHOTO_MAX_SIDE} px com uma pequena marca no canto. Cadastro com e-mail, sem cartão.`,
    cta: "Trocar um rosto grátis",
  },
  de: {
    label: "Gratis",
    daily: `Jeden Tag ${DAILY_FREE_FACE_SWAPS} Gesichtstausch im Foto gratis`,
    signup: `+ ${SIGNUP_GRANT_CREDITS} Gratis-Credits für neue Konten (${SIGNUP_FREE_SWAPS} weitere Tausche)`,
    note: `Kein Wasserzeichen auf Gratis-Fotos: bis zu ${FREE_PHOTO_MAX_SIDE} px mit einem kleinen Zeichen in der Ecke. Anmeldung per E-Mail, keine Karte.`,
    cta: "Gratis ein Gesicht tauschen",
  },
  fr: {
    label: "Gratuit",
    daily: `${DAILY_FREE_FACE_SWAPS} échange de visage photo gratuit chaque jour`,
    signup: `+ ${SIGNUP_GRANT_CREDITS} crédits gratuits pour les nouveaux comptes (${SIGNUP_FREE_SWAPS} échanges de plus)`,
    note: `Pas de filigrane sur les photos gratuites : jusqu’à ${FREE_PHOTO_MAX_SIDE} px avec une petite marque dans un coin. Inscription par e-mail, sans carte.`,
    cta: "Échanger un visage gratuitement",
  },
};

export function FreeOfferStrip({ locale }: { locale: AppLocale }) {
  const c = TEXT[locale] ?? TEXT.en;
  return (
    <section aria-label={c.label} className="relative z-10 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              {c.label}
            </span>
            <span className="text-base font-bold text-foreground sm:text-lg">{c.daily}</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {c.signup}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{c.note}</p>
        </div>
        <Link
          href={translatedOrEnglish("/face-studio", locale)}
          className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 sm:self-center"
        >
          {c.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
