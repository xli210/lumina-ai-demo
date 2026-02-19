import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/account");
  }

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
          <p className="mt-1 text-muted-foreground">
            Manage users, licenses, and system settings
          </p>
        </div>
        <AdminDashboard />
      </div>
      <Footer />
    </main>
  );
}
