"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** What a business can ask for. None of these is a product yet; the answers decide what is built. */
export const BUSINESS_NEEDS = [
  { value: "api", label: "API access" },
  { value: "volume", label: "More credits than the largest pack, or a monthly plan" },
  { value: "invoice", label: "Invoices with our company name and VAT or tax number" },
  { value: "seats", label: "Desktop licences for several people" },
  { value: "custom", label: "Custom work or running it on our own servers" },
];

const VOLUMES = ["Not sure yet", "Under $100 a month", "$100 to $500 a month", "$500 to $2,000 a month", "Over $2,000 a month"];

const MAX = 3000;

/**
 * The /business request form. It goes to /api/contact as kind "business", like the business choice
 * on /contact, with the answers written into the message so /admin/messages shows them as they are.
 */
export function BusinessForm() {
  const [needs, setNeeds] = useState<string[]>([]);
  const [volume, setVolume] = useState(VOLUMES[0]);
  const [details, setDetails] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (value: string) =>
    setNeeds((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (needs.length === 0) {
      setError("Tick at least one thing you need.");
      return;
    }
    if (!email.trim()) {
      setError("Leave an email so we can reply.");
      return;
    }
    const wanted = BUSINESS_NEEDS.filter((n) => needs.includes(n.value)).map((n) => n.label);
    const message = [
      `[business] needs: ${needs.join(", ")}`,
      `Company: ${company.trim() || "-"}`,
      `Volume: ${volume}`,
      `Wants: ${wanted.join("; ")}`,
      "",
      details.trim() || "(no details)",
    ].join("\n");

    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "business", message, name, email, website, page: "/business" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || "Something went wrong. Please try again.");
      else setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl glass p-8 text-center sm:p-10">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h2 className="mb-2 text-xl font-bold text-foreground">Thank you, we got it.</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We read every request and will reply by email.
        </p>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-medium text-foreground";
  return (
    <form onSubmit={submit} className="rounded-2xl glass p-6 sm:p-10" noValidate>
      <h2 className="mb-1 text-xl font-bold text-foreground">Tell us what your team needs</h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        A few lines are enough. We reply by email.
      </p>

      <div className="grid gap-5">
        <fieldset>
          <legend className={label}>What do you need?</legend>
          <div className="grid gap-2">
            {BUSINESS_NEEDS.map((n) => (
              <label key={n.value} className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={needs.includes(n.value)}
                  onChange={() => toggle(n.value)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span>{n.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="b-volume" className={label}>Expected spend</label>
          <select
            id="b-volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {VOLUMES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="b-details" className={label}>
            What would you use it for? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="b-details"
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, MAX))}
            rows={5}
            placeholder="For example: product photos with one model across 200 items a month, or several versions of a video ad."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="b-email" className={label}>Work email</label>
            <Input id="b-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div>
            <label htmlFor="b-company" className={label}>
              Company <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input id="b-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} />
          </div>
        </div>

        <div>
          <label htmlFor="b-name" className={label}>
            Name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input id="b-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
        </div>

        {/* Honeypot: invisible to people and to screen readers. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={busy} className="gap-2 rounded-full px-6">
            <Send className="h-4 w-4" />
            {busy ? "Sending..." : "Send request"}
          </Button>
          <p className="text-xs text-muted-foreground">
            We use your contact only to reply about this request. See our{" "}
            <a href="/privacy" className="underline underline-offset-4">privacy policy</a>.
          </p>
        </div>
      </div>
    </form>
  );
}
