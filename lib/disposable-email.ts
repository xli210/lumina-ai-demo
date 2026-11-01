/**
 * Throwaway-inbox domains: addresses that anyone can read and that vanish
 * after an hour, used to open account after account for the free credits.
 *
 * An account on one of these still signs up, signs in and can buy credits;
 * only the free sign-up credits are withheld (see lib/free-claim.ts). That is
 * why the list can be firm without locking a real person out.
 *
 * Services such as temp-mail rotate through fresh random domains, so this
 * list goes stale. The first block is what actually turned up in our sign-ups
 * (2026-10-23 to 11-01, 31 accounts, 20 of them on 10-31); the rest are the
 * long-lived public services. To find new ones, run the "Throwaway domains"
 * query in docs/credit-system.md and add any domain whose addresses are all
 * random strings.
 */
const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  // Seen in our own sign-ups.
  "ooynib.com",
  "tanpony.com",
  "yzcalo.com",
  "lnovic.com",
  "hopefunder.com",
  "nickmxh.com",
  "choigi.com",
  "hiringview.com",
  "agaexpress.com",
  "bookgame.org",
  "37xiao.com",
  "moblha.com",
  // Long-lived public services.
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "33mail.com",
  "anonaddy.me",
  "burnermail.io",
  "byom.de",
  "dispostable.com",
  "dropmail.me",
  "emailfake.com",
  "emailnator.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemail.net",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "inboxkitten.com",
  "mail.tm",
  "mail7.io",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailinator.net",
  "mailnesia.com",
  "mailpoof.com",
  "mintemail.com",
  "mohmal.com",
  "moakt.com",
  "mytemp.email",
  "nada.email",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "tempmail.dev",
  "tempmail.net",
  "tempmailo.com",
  "tempr.email",
  "throwawaymail.com",
  "tmail.ws",
  "tmpmail.net",
  "tmpmail.org",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

/** True when the address is on a throwaway-inbox domain (or a subdomain of one). */
export function isDisposableEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  let domain = email.slice(at + 1).trim().toLowerCase();
  while (domain.includes(".")) {
    if (DISPOSABLE_DOMAINS.has(domain)) return true;
    domain = domain.slice(domain.indexOf(".") + 1);
  }
  return false;
}
