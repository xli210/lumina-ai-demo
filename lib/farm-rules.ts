/**
 * Whether an address's mail looks like an account farm's, from what earlier sign-ups tell (lib/free-claim.ts asks, then records the
 * domain and the mail provider of every claim, so the rules learn by themselves).
 *
 * 2026-11-28: four accounts on thinkatime.com and one on tipsfuel.com, random local parts (wifono7010, geliwe2650, ...), each spent its
 * welcome credits on HeadSwap Pro within minutes. Both domains receive their mail on one machine (159.203.157.224, mail.<domain>). The
 * rule then in force refused a mail server only once it had served two OTHER domains, and a farm that keeps to one or two domains never
 * reached that: every account of the same domain was let through. So:
 *
 *   1. a provider already known as temp mail: refused;
 *   2. a big mail provider (Gmail, Outlook, Google Workspace, ...): never refused by these rules;
 *   3. a mail server the domain runs itself (an "ip:" key, mail.<domain>): refused once it serves one other domain of our sign-ups;
 *      a real company's own server serves its own domain;
 *   4. any other provider: refused once it serves two other domains (as before);
 *   5. a domain that is not on a big provider and already had MAX_GRANTED_PER_SMALL_DOMAIN accounts granted free credits within
 *      SMALL_DOMAIN_WINDOW_DAYS: refused (a farm's single domain; a real small company rarely opens that many free accounts a week).
 *
 * A refusal only withholds the free credits: the account still signs in and can buy (see lib/free-claim.ts).
 */

export const MAX_OTHER_DOMAINS_PER_MAIL_SERVER = 2;
export const MAX_OTHER_DOMAINS_PER_OWN_SERVER = 1;
export const MAX_GRANTED_PER_SMALL_DOMAIN = 2;
export const SMALL_DOMAIN_WINDOW_DAYS = 7;

export interface FarmFacts {
  /** The mail provider key of the address (lib/mail-provider.ts mailProviderOf), or null when it could not be told. */
  provider: string | null;
  /** Other email domains among recent sign-ups that share this provider. */
  otherDomains: number;
  /** Accounts on this same domain granted free credits within SMALL_DOMAIN_WINDOW_DAYS. */
  sameDomainGranted: number;
}

export interface FarmVerdict {
  refuse: boolean;
  why: string | null;
}

export function farmVerdict(f: FarmFacts, tempProviders: ReadonlySet<string>, majorProviders: ReadonlySet<string>): FarmVerdict {
  const p = f.provider;
  if (!p) return { refuse: false, why: null };                       // the mail server could not be told: nothing to go on
  if (tempProviders.has(p)) return { refuse: true, why: "temp-mail provider " + p };
  if (majorProviders.has(p)) return { refuse: false, why: null };
  const own = p.startsWith("ip:");
  const limit = own ? MAX_OTHER_DOMAINS_PER_OWN_SERVER : MAX_OTHER_DOMAINS_PER_MAIL_SERVER;
  if (f.otherDomains >= limit) {
    return { refuse: true, why: `${own ? "own mail server" : "mail server"} ${p} serves ${f.otherDomains} other sign-up domain(s)` };
  }
  if (f.sameDomainGranted >= MAX_GRANTED_PER_SMALL_DOMAIN) {
    return { refuse: true, why: `${f.sameDomainGranted} accounts of this domain already had free credits in ${SMALL_DOMAIN_WINDOW_DAYS} days` };
  }
  return { refuse: false, why: null };
}
