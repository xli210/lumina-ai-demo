"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONFIRM_DELAY_SECONDS, confirmationMatches, secondsLeft } from "@/lib/admin-confirm";

/**
 * The last look before an admin action that is hard to take back: making
 * someone an admin, banning an account, revoking a license.
 *
 * It is built so that a stray tap cannot get through, and so that a habit
 * cannot either:
 *   - nothing happens when it opens, and "Cancel" is the focused button;
 *   - the action is spelled out, with the account it will hit (name, email, age);
 *   - the person must TYPE the account's email (or the license key). Paste and
 *     drop are blocked, so it cannot be done without reading it;
 *   - the confirm button stays disabled for a few seconds after the dialog opens;
 *   - clicking outside does not close it, and Enter does nothing until it is ready.
 *
 * The same typed text is sent to the database function, which refuses a request
 * that does not match (scripts/016_admin_guardrails.sql).
 */

export interface ConfirmActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One sentence: what will happen. */
  summary: string;
  /** What the action lets the account do or stops it doing. */
  consequences?: string[];
  /** The account (or license) it will act on, as short lines for a person to check. */
  target: { heading: string; lines: string[] } | null;
  /** True while the account details are still loading. */
  loadingTarget?: boolean;
  /** Shown in red; when `block` is true the action cannot be confirmed at all. */
  warning?: string | null;
  block?: boolean;
  /** The exact text the person must type (an email address or a license key). */
  expected: string | null;
  /** What to call the thing being typed: "email" or "license key". */
  expectedLabel: string;
  confirmLabel: string;
  tone?: "danger" | "caution";
  /** Runs the action with the typed text. Returns an error message, or null on success. */
  onConfirm: (typed: string) => Promise<string | null>;
  onDone?: () => void;
}

export function ConfirmActionDialog(props: ConfirmActionProps) {
  const {
    open,
    onOpenChange,
    title,
    summary,
    consequences,
    target,
    loadingTarget,
    warning,
    block,
    expected,
    expectedLabel,
    confirmLabel,
    tone = "danger",
    onConfirm,
    onDone,
  } = props;

  const [typed, setTyped] = useState("");
  const [left, setLeft] = useState(CONFIRM_DELAY_SECONDS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openedAt = useRef(0);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Each time the dialog opens: clear everything and start the wait.
  useEffect(() => {
    if (!open) return;
    openedAt.current = Date.now();
    setTyped("");
    setError(null);
    setPending(false);
    setLeft(CONFIRM_DELAY_SECONDS);
    const id = window.setInterval(() => {
      setLeft(secondsLeft(openedAt.current, Date.now()));
    }, 200);
    return () => window.clearInterval(id);
  }, [open]);

  const typedOk = expected !== null && confirmationMatches(typed, expected);
  const ready = typedOk && left === 0 && !pending && !block && !loadingTarget;

  async function submit() {
    if (!ready) return;
    setPending(true);
    setError(null);
    const err = await onConfirm(typed);
    setPending(false);
    if (err) {
      setError(err);
      return;
    }
    onOpenChange(false);
    onDone?.();
  }

  const accent = tone === "danger" ? "text-red-500" : "text-amber-500";

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          // Land on Cancel, never on anything that does the thing.
          e.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className={`h-5 w-5 ${accent}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>

        {loadingTarget ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading the account details...
          </div>
        ) : target ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
            <p className="font-semibold text-foreground">{target.heading}</p>
            {target.lines.map((l) => (
              <p key={l} className="mt-0.5 text-xs text-muted-foreground">
                {l}
              </p>
            ))}
          </div>
        ) : null}

        {consequences && consequences.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            {consequences.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}

        {warning && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs leading-relaxed text-red-400"
          >
            {warning}
          </p>
        )}

        {!block && expected && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="space-y-2"
          >
            <label htmlFor="confirm-typed" className="block text-xs text-muted-foreground">
              To continue, type the {expectedLabel}{" "}
              <span className="select-none break-all font-mono font-semibold text-foreground">{expected}</span>
            </label>
            <Input
              id="confirm-typed"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="email"
              aria-invalid={typed.length > 0 && !typedOk}
              disabled={pending}
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              {typedOk ? "That matches." : "Pasting is turned off on purpose: type it."}
            </p>
            {error && (
              <p role="alert" className="text-xs text-red-400">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2 pt-1 sm:gap-2">
              <Button
                ref={cancelRef}
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={tone === "danger" ? "destructive" : "default"}
                disabled={!ready}
                className="gap-2"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {left > 0 ? `${confirmLabel} (${left})` : confirmLabel}
              </Button>
            </DialogFooter>
          </form>
        )}

        {(block || !expected) && (
          <DialogFooter>
            <Button ref={cancelRef} type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
