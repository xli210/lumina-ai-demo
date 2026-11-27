import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_TIER, FREE_TIER_COMPARISON_SOURCE } from "@/lib/free-tier";

/**
 * "What you can try for free, and in what quality": the free credits, what they buy in each online tool
 * and the output size, as a table an AI answer can quote. Copy and figures are in lib/free-tier.ts.
 */
export function FreeTierBlock({
  lang,
  id = "free",
  compareLink = true,
  signUpHref = "/auth/sign-up",
}: {
  lang: "en" | "pt-BR";
  id?: string;
  compareLink?: boolean;
  /** Where the sign-up button goes; a page can add ?next= so sign-up ends in its tool. */
  signUpHref?: string;
}) {
  const c = FREE_TIER[lang];
  return (
    <section id={id} className="px-6 pb-12">
      <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{c.heading}</h2>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">{c.answer}</p>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">{c.head.tool}</th>
                <th className="px-4 py-3 font-medium">{c.head.free}</th>
                <th className="px-4 py-3 font-medium">{c.head.quality}</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.tool} className="border-b border-border/50 last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">{r.tool}</th>
                  <td className="px-4 py-3 text-muted-foreground">{r.free}</td>
                  <td className="px-4 py-3 text-foreground">{r.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.shared}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.limits}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {c.comparison}{" "}
          <a href={FREE_TIER_COMPARISON_SOURCE} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
            Magic Hour
          </a>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desktop}</p>
        {compareLink && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <Link href={lang === "en" ? "/best-free-face-swap" : "/pt-BR/best-free-face-swap"} className="font-medium text-primary hover:underline">
              {lang === "en" ? "Free face swap sites compared: Magic Hour, Remaker, PixNova, Vidnoz" : "Sites de troca de rosto grátis comparados: Magic Hour, Remaker, PixNova, Vidnoz"}
            </Link>
          </p>
        )}
        <Link
          href={signUpHref}
          className="mt-5 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {c.cta} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
