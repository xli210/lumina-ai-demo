import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { START_PATH } from "@/lib/start-tools";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { StartHub } from "./start-hub";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Ui.start");
  return { title: t("title"), robots: { index: false, follow: true } };
}

/** Where sign-in and sign-up end when nothing asked for another page: the tools, not the account settings. */
export default async function StartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(START_PATH)}`);
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <StartHub />
      <Footer />
    </main>
  );
}
