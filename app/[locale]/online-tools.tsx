import Link from "next/link";
import { ArrowRight, CheckCircle2, Clapperboard, ImageIcon, UserRoundCog, Wand2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SIGNUP_GRANT_CREDITS } from "@/lib/credits";
import { FACE_STUDIO_NAME, FACE_SWAP_CREDITS, HEAD_SWAP_CREDITS } from "@/lib/face-studio-facts";
import { HEADSWAP_PRO_CREDITS_PER_IMAGE, HEADSWAP_PRO_NAME } from "@/lib/headswap-pro";
import { FACESTUDIO_V_NAME, FACESTUDIO_V_PAGE } from "@/lib/facestudio-v";
import { IMAGEEDIT_CREDITS_PER_EDIT, IMAGEEDIT_NAME } from "@/lib/imageedit";
import { translatedOrEnglish, type AppLocale } from "@/lib/i18n/locales";

/**
 * The four online tools, as cards, for the translated pages (/<locale>/face-swap and /zh-CN). Words come from
 * the OnlineTools namespace in messages/<locale>.json; names, prices and links come from the same constants the
 * tools bill with. Prices are shown in credits only.
 */

type ToolKey = "faceStudio" | "headSwap" | "video" | "imageEdit";

export const PRICE_PARAMS = {
  grant: SIGNUP_GRANT_CREDITS,
  face: FACE_SWAP_CREDITS,
  head: HEAD_SWAP_CREDITS,
  hsp: HEADSWAP_PRO_CREDITS_PER_IMAGE,
  edit: IMAGEEDIT_CREDITS_PER_EDIT,
};

const accents = {
  faceStudio: "border-violet-500/30 bg-violet-500/10 text-violet-500",
  headSwap: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  video: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  imageEdit: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
} as const;

export async function OnlineToolCards({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "OnlineTools" });
  const tools: { key: ToolKey; name: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "faceStudio", name: FACE_STUDIO_NAME, href: "/face-studio", Icon: ImageIcon },
    { key: "headSwap", name: HEADSWAP_PRO_NAME, href: translatedOrEnglish("/headswap-pro", locale), Icon: UserRoundCog },
    { key: "video", name: FACESTUDIO_V_NAME, href: FACESTUDIO_V_PAGE, Icon: Clapperboard },
    { key: "imageEdit", name: IMAGEEDIT_NAME, href: "/image-edit", Icon: Wand2 },
  ];

  return (
    <div>
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("heading")}</h2>
      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t("intro", PRICE_PARAMS)}</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {tools.map(({ key, name, href, Icon }) => (
          <div key={key} className="flex flex-col rounded-2xl border border-border/60 bg-background/60 p-6">
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accents[key]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-foreground">{name}</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{t(`${key}.blurb`)}</p>
            <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
              {([1, 2, 3] as const).map((n) => (
                <li key={n} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{t(`${key}.bullet${n}`)}</span>
                </li>
              ))}
            </ul>
            <p className="mb-5 text-sm font-medium text-foreground">{t(`${key}.price`, PRICE_PARAMS)}</p>
            <Link href={href} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline">
              {t("openCta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">{t("watermarkNote")} {t("englishNote")}</p>
    </div>
  );
}
