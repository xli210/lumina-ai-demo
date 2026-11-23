"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { requestFreeCreditReview } from "@/app/actions/free-credit-review";

/** Under the "no free credits" notice on /credits: ask a person to look at the account. */
export function FreeCreditReview({ requested, email }: { requested: boolean; email: string | null }) {
  const t = useTranslations("Ui.credits");
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "failed">(requested ? "sent" : "idle");
  const [pending, start] = useTransition();

  if (state === "sent") {
    return <p className="mt-3 font-medium text-foreground">{requested ? t("reviewPending") : t("reviewSent", { email: email ?? "" })}</p>;
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {t("reviewButton")}
        </button>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await requestFreeCreditReview(note);
              setState("ok" in r || r.error === "already" ? "sent" : "failed");
            });
          }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={t("reviewNote")}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {t("reviewSend")}
          </button>
          {state === "failed" && <p className="text-sm text-destructive">{t("reviewFailed")}</p>}
        </form>
      )}
    </div>
  );
}
