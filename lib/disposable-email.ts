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
  "thinkatime.com", // 2026-11-28: four accounts, random local parts, HeadSwap Pro credits spent at once (with tipsfuel.com, one mail server)
  "tipsfuel.com",
  // Found 2026-11-05 while building the email list: random local parts only.
  "gmeenramy.com",
  "olipii.com",
  "findize.com",
  "deertees.com",
  "48hr.email",
  "cloud-temp.com",
  "emailinbo.live",
  "onmailflare.com",
  // Found 2026-11-22: one farm, 34 accounts 11/19-11/22, no purchase; both
  // domains receive mail on the same self-hosted server.
  "thechiv.com",
  "volhoo.com",
  // Found 2026-11-23: the same farm moved on to these (zefvo.com since 11/15).
  // lib/mail-provider.ts now catches the next ones by their mail server.
  "qelmvolx.cfd",
  "zornrax.cfd",
  "phyxzax.cfd",
  "redpaper.info",
  "zefvo.com",
  "vgmale.com",
  // Found 2026-11-09: every address on them is a random string.
  "ruutukf.com",
  "emailkeep.com",
  "en2ch.com",
  "bankwen.com",
  "boffweb.com",
  "drtall.com",
  "digeros.com",
  "bwmyga.com",
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

/**
 * Top-level domains sold for about a dollar and used almost only for spam and throwaway mail.
 * On 2026-11-23 none of our users had an address on one except the farm (8 accounts on .cfd,
 * no purchase), so an address on any of them gets no free credits, whatever the name.
 */
const ABUSE_TLDS: ReadonlySet<string> = new Set([
  "cfd", "sbs", "cyou", "icu", "bond", "click", "lol", "monster", "rest", "quest", "buzz",
  "beauty", "hair", "makeup", "skin", "autos", "boats", "homes", "motorcycles", "yachts", "mom",
]);

/** The domain part of an address, lowercased, or null. */
export function emailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.includes(".") ? domain : null;
}

/** True when the address is on a throwaway-inbox domain (or a subdomain of one), or a spam TLD. */
export function isDisposableEmail(email: string | null | undefined): boolean {
  let domain = emailDomain(email);
  if (!domain) return false;
  if (ABUSE_TLDS.has(domain.slice(domain.lastIndexOf(".") + 1))) return true;
  while (domain.includes(".")) {
    if (DISPOSABLE_DOMAINS.has(domain)) return true;
    domain = domain.slice(domain.indexOf(".") + 1);
  }
  return false;
}

/**
 * The mailbox an address really delivers to: without a +tag, and on Gmail without dots.
 * null when it is not an address.
 */
export function canonicalEmail(email: string | null | undefined): string | null {
  const address = email?.trim().toLowerCase();
  if (!address) return null;
  const at = address.lastIndexOf("@");
  if (at <= 0 || at === address.length - 1) return null;
  const local = address.slice(0, at).split("+")[0];
  const domain = address.slice(at + 1);
  if (!local) return null;
  if (domain === "gmail.com" || domain === "googlemail.com") return `${local.replace(/\./g, "")}@gmail.com`;
  return `${local}@${domain}`;
}
