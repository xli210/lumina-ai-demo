import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { hasEverPurchased } from "@/lib/credits-server";
import { imageLink, imagesOf, MY_IMAGES_HOURS, type MyImage } from "@/lib/my-images-server";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";

/**
 * /my-images: the signed-in person's pictures of the last day from Nano FaceStudio Online and Nano HeadSwap Pro.
 *
 * Like /facestudio-v/videos: a person who closed the page while a GPU was starting finds the picture here. Each row opens the product with the
 * job in the link, and the product shows the picture when it is ready (lib/my-images-server.ts).
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My images | NanoPocket",
  robots: { index: false, follow: false },
};

const PRODUCT: Record<MyImage["product"], string> = {
  facestudio: "Nano FaceStudio Online",
  "headswap-pro": "Nano HeadSwap Pro",
};

function describe(i: MyImage): string {
  if (i.status === "captured") return `Made. ${i.credits} credits.`;
  if (i.status === "open") return "Being made, or waiting for a GPU. Open it to see.";
  return "Not charged. Open it: if it was made after all, it is shown there.";
}

export default async function MyImagesPage() {
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
          <h1 className="text-3xl font-bold text-foreground">My images</h1>
          <p className="mt-1 text-muted-foreground">Your pictures of the last {MY_IMAGES_HOURS} hours from Nano FaceStudio Online and Nano HeadSwap Pro.</p>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
          Pictures are kept for about a day after they are made, then deleted for good: download the ones you want. A picture that was made is charged;
          one that could not be made is not. You can leave a page while its picture is made: it is here when you come back.
          {paid ? null : (
            <>
              {" "}
              <Link href="/credits" className="font-medium text-primary underline-offset-4 hover:underline">
                Add credits
              </Link>{" "}
              once to run up to 3 pictures at a time instead of 1.
            </>
          )}
        </div>

        {failed ? (
          <p className="text-sm text-muted-foreground">Your images could not be loaded right now. Please try again in a minute.</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No images in the last {MY_IMAGES_HOURS} hours.{" "}
            <Link href="/face-studio/launch" className="font-medium text-primary underline-offset-4 hover:underline">
              Open Nano FaceStudio Online
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
                      {new Date(i.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{describe(i)}</div>
                </div>
                <a href={imageLink(i)} className={buttonVariants({ size: "sm" })}>
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </main>
  );
}
