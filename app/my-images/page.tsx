import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { hasEverPurchased } from "@/lib/credits-server";
import { imageLink, imagesOf, MY_IMAGES_HOURS, type MyImage } from "@/lib/my-images-server";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { SpotEditResultView } from "./spotedit-result";

/**
 * /my-images: the signed-in person's pictures of the last day from Nano FaceStudio Online, Nano HeadSwap Pro and SpotEdit.
 *
 * Like /facestudio-v/videos: a person who closed the page while a GPU was starting finds the picture here. Each row opens the product with the
 * job in the link, and the product shows the picture when it is ready (lib/my-images-server.ts).
 */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Ui.myImages");
  return { title: `${t("title")} | NanoPocket`, robots: { index: false, follow: false } };
}

const PRODUCT: Record<MyImage["product"], string> = {
  facestudio: "Nano FaceStudio Online",
  "headswap-pro": "Nano HeadSwap Pro",
  spotedit: "SpotEdit",
};

export default async function MyImagesPage() {
  const t = await getTranslations("Ui.myImages");
  const locale = await getLocale();
  const describe = (i: MyImage): string => {
    if (i.status === "captured") return t("made", { credits: i.credits });
    if (i.status === "open") return t("making");
    return t("notCharged");
  };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent("/my-images")}`);
  }

  let images: MyImage[] = [];
  let failed = false;
  try {
    images = await imagesOf(user.id);
  } catch (err: unknown) {
    console.error("[my-images] list failed:", err instanceof Error ? err.message : err);
    failed = true;
  }
  let paid = false;
  try {
    paid = await hasEverPurchased(user.id);
  } catch (err: unknown) {
    console.error("[my-images] could not tell whether the account has paid:", err instanceof Error ? err.message : err);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle", { hours: MY_IMAGES_HOURS })}</p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          {t("notice")}
          {paid ? null : (
            <>
              {" "}
              {t.rich("addCredits", {
                credits: (chunks) => (
                  <Link href="/credits?from=images_keep" className="font-medium text-primary underline-offset-4 hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </>
          )}
        </div>

        {failed ? (
          <p className="text-sm text-muted-foreground">{t("failed")}</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("empty", { hours: MY_IMAGES_HOURS })}{" "}
            <Link href="/face-studio/launch" className="font-medium text-primary underline-offset-4 hover:underline">
              {t("openStudio")}
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {images.map((i) => (
              <li key={i.job} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">
                    {PRODUCT[i.product]}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {new Date(i.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{describe(i)}</div>
                </div>
                {i.edit ? (
                  <div className="flex gap-2">
                    <a href={i.edit.download} className={buttonVariants({ size: "sm" })}>
                      {t("download")}
                    </a>
                    <a href={imageLink(i)} className={buttonVariants({ size: "sm", variant: "outline" })}>
                      {t("openEditor")}
                    </a>
                  </div>
                ) : (
                  <a href={imageLink(i)} className={buttonVariants({ size: "sm" })}>
                    {t("open")}
                  </a>
                )}
                {i.edit ? (
                  <div className="w-full">
                    <SpotEditResultView
                      edit={i.edit}
                      labels={{ before: t("before"), after: t("after"), compare: t("compare") }}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  );
}
