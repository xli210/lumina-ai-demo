import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { AccountProfile } from "./account-profile";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Account</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your profile and account settings
          </p>
        </div>
        <AccountProfile user={user} profile={profile} />
      </div>
      <Footer />
    </main>
  );
}
