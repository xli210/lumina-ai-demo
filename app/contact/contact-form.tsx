"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const KINDS = [
  { value: "feature", label: "A feature I would like" },
  { value: "improvement", label: "Something to improve" },
  { value: "bug", label: "Something is broken" },
  { value: "question", label: "A question" },
  { value: "business", label: "Business or partnership" },
  { value: "other", label: "Something else" },
];

const MAX = 4000;

export function ContactForm() {
  const [kind, setKind] = useState("feature");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [other, setOther] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message,
          name,
          email,
          other_contact: other,
          website,
          page: document.referrer ? new URL(document.referrer).pathname : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
      } else {
        setDone(true);
      }
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
          We read every message. If you left a way to reach you, we will reply there.
        </p>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-medium text-foreground";
  return (
    <form onSubmit={submit} className="rounded-2xl glass p-8 sm:p-10" noValidate>
      <h2 className="mb-1 text-xl font-bold text-foreground">Tell us what to build or fix</h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Ideas, problems and requests go straight to the people who build the product. Leave your contact so we can follow up.
      </p>

      <div className="grid gap-5">
        <div>
          <label htmlFor="c-kind" className={label}>What is this about?</label>
          <select
            id="c-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="c-message" className={label}>Your message</label>
          <Textarea
            id="c-message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
            rows={6}
            required
            placeholder="What would you like us to add, improve or fix? The more concrete, the better."
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/{MAX}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="c-email" className={label}>Email</label>
            <Input id="c-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="c-other" className={label}>Or WeChat / Telegram / X</label>
            <Input id="c-other" value={other} onChange={(e) => setOther(e.target.value)} placeholder="optional if you gave an email" maxLength={200} />
          </div>
        </div>

        <div>
          <label htmlFor="c-name" className={label}>Name <span className="font-normal text-muted-foreground">(optional)</span></label>
          <Input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
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
            {busy ? "Sending..." : "Send message"}
          </Button>
          <p className="text-xs text-muted-foreground">
            We use your contact only to reply about this message. See our <a href="/privacy" className="underline underline-offset-4">privacy policy</a>.
          </p>
        </div>
      </div>
    </form>
  );
}
