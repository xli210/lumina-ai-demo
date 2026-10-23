"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContactForm } from "../contact/contact-form";

/**
 * A "Feedback" tab on every page, bottom right, that opens the contact form in a window
 * so a visitor can send an idea or a problem without leaving what they are doing.
 * Left out where it would sit on top of something else: the contact page itself (the
 * form is already there), sign-in, checkout and the admin console.
 */
const QUIET_PREFIXES = ["/contact", "/auth", "/checkout", "/admin"];

export function FeedbackButton() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  if (QUIET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-muted sm:bottom-6 sm:right-6"
        >
          <MessageSquarePlus className="h-4 w-4 text-primary" />
          Feedback
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogTitle className="sr-only">Send feedback</DialogTitle>
        <DialogDescription className="sr-only">Tell us what to build or fix, and how to reach you.</DialogDescription>
        <ContactForm page={pathname} compact />
      </DialogContent>
    </Dialog>
  );
}
