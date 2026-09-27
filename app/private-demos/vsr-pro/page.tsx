import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Navbar } from "@/app/components/navbar";
import { Footer } from "@/app/components/footer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isVsrProConfigured } from "@/lib/vsrpro-server";
import { VSRPRO_DEFAULT_BASE_URL } from "@/lib/vsrpro";
import { VsrProConsole } from "./console";

/**
 * /private-demos/vsr-pro
 *
 * Console for the VSR-Pro video-upscale gateway (API v1, revision 1.3).
 *
 * §2 and §8 of the API doc rule out calling the gateway from the browser:
 * the key is a server-side secret. So this page renders a client console that
 * only ever talks to our own /api/vsrpro/* proxy, which injects the Bearer
 * token server-side. The two bulk transfers skip the proxy and go straight to
 * object storage over presigned URLs, which is what those URLs are for.
 *
 * Gated the same way as the rest of /private-demos: noindex, robots.txt
 * disallow, anonymous visitors bounced to login, non-admins bounced to
 * /account, and every proxy route re-checks the role.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VSR-Pro console \u2014 admin only",
  description:
    "Internal console for the VSR-Pro video super-resolution gateway. Not indexed, not linked from any public page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: undefined },
};

export default async function VsrProConsolePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/private-demos/vsr-pro");
  }
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const baseUrl = process.env.VSRPRO_BASE_URL || VSRPRO_DEFAULT_BASE_URL;
  const upstreamHost = baseUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return (
    <main className="relative min-h-screen bg-black text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 pt-28 pb-20 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(circle_at_15%_115%,rgba(139,92,246,0.08),transparent_60%)]" />

        <div className="mx-auto max-w-4xl">
          <Link
            href="/private-demos"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Private demos
          </Link>

          <div className="mt-5 mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-400">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Admin console
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            VSR-Pro 视频放大控制台
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/70">
            上传 → 处理 → 下载,跑的就是 API v1（1.3 修订版）的三步异步流程。API Key
            只存在服务端:这个页面只调用同源的{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-xs">
              /api/vsrpro/*
            </code>{" "}
            代理,由代理注入{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-xs">
              Authorization: Bearer
            </code>
            。大文件的上传与下载走限时预签名地址直连对象存储,不经过我们的服务器。
          </p>

          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
            proxying → {upstreamHost}
          </p>

          <div className="mt-10">
            <VsrProConsole configured={isVsrProConfigured()} />
          </div>

          <div className="mt-8 flex flex-wrap items-start gap-2 text-xs leading-relaxed text-white/45">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              完整契约见{" "}
              <code className="rounded bg-white/10 px-1 font-mono">
                docs/vsr-pro-api.zh-CN.md
              </code>
              ,共享的枚举、限制与字段类型见{" "}
              <code className="rounded bg-white/10 px-1 font-mono">lib/vsrpro.ts</code>
              ,服务端配置见{" "}
              <code className="rounded bg-white/10 px-1 font-mono">
                lib/vsrpro-server.ts
              </code>
              。
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
