import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * Said up front, because the first thing some people see is their browser or
 * antivirus blocking the file. The installers are not Authenticode-signed (see
 * lib/download-hashes.ts), which is what makes a new publisher's file look
 * suspicious to SmartScreen and to heuristic antivirus engines.
 */
export function WindowsWarning() {
  return (
    <section className="px-6 pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          Did Windows, your browser or your antivirus block a download?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Our Windows installers are not yet code-signed, so SmartScreen or antivirus software may
          warn about them or quarantine them, even though nothing is wrong with the file. We are
          getting a code-signing certificate to fix this. Until then:
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Compare the file with the SHA-256 listed on{" "}
            <Link href="/verify#hashes" className="font-medium text-primary underline-offset-4 hover:underline">
              /verify
            </Link>{" "}
            (<code className="rounded bg-muted px-1 py-0.5 text-xs">certutil -hashfile &lt;file&gt; SHA256</code>). If it
            differs, do not run it and tell us.
          </li>
          <li>
            If it matches, keep the download (Chrome or Edge: open the downloads list and choose
            Keep). If SmartScreen appears, choose More info, then Run anyway.
          </li>
          <li>
            If your antivirus quarantined it, restore it from quarantine, or report the false
            positive to the vendor.{" "}
            <Link href="/verify#signing" className="font-medium text-primary underline-offset-4 hover:underline">
              Details
            </Link>
            .
          </li>
        </ol>
      </div>
    </section>
  );
}
