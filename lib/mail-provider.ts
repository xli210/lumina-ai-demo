import "server-only";
import { promises as dns } from "node:dns";

/**
 * Who receives the mail for an address: the fingerprint that survives a farm changing domains.
 *
 * Temp-mail services and account farms buy new domains all the time, so a list of domains is
 * always one step behind (lib/disposable-email.ts). They do not move their mail server as often:
 * on 2026-11-23 every domain of the farm that switched from thechiv.com/volhoo.com to .cfd names
 * received its mail on one of three servers, and one temp-mail service alone delivered for 41 of
 * our users' domains (60 accounts, no purchase) through mail.wabblywabble.com/mail.wallywatts.com.
 *
 * `mailProviderOf` turns an email domain into a provider key:
 *   - the registrable domain of its main MX host ("google.com", "wabblywabble.com"), or
 *   - "ip:<address>" when the domain runs its own mail server (mail.<domain>), because then the
 *     host name changes with every domain but the machine does not.
 *
 * lib/free-claim.ts refuses the free credits when that key is a known temp-mail provider, and
 * learns new ones: a key that is not a big mail provider and has already received sign-ups from
 * other domains is a server handing out addresses on many domains, which is what temp mail is.
 */

/** Second-level suffixes under which the registrable domain has three labels. */
const MULTI_LABEL_SUFFIXES: ReadonlySet<string> = new Set([
  "co.uk", "org.uk", "ac.uk", "com.au", "net.au", "com.br", "com.ar", "com.mx", "com.cn",
  "com.tw", "com.hk", "co.jp", "ne.jp", "or.jp", "co.kr", "co.nz", "co.in", "co.za", "com.tr",
]);

export function registrableDomain(host: string): string {
  const labels = host.trim().toLowerCase().replace(/\.$/, "").split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  return MULTI_LABEL_SUFFIXES.has(lastTwo) ? labels.slice(-3).join(".") : lastTwo;
}

/**
 * Temp-mail providers seen in our sign-ups (2026-11-23 scan of every user domain's MX).
 * Domain keys are MX host domains; "ip:" keys are self-hosted farm servers.
 */
export const TEMP_MAIL_PROVIDERS: ReadonlySet<string> = new Set([
  "wabblywabble.com", // 41 domains, 60 accounts, 0 buyers (with wallywatts.com)
  "wallywatts.com",
  "oneb.net", // smtp.oneb.net: 8 domains, 10 accounts, 0 buyers
  "erinn.biz", // Japanese throwaway service (adadad.uk, f5.si, macr2.com, otona.uk)
  "tempamail.com",
  "email-fake.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "ip:65.21.54.62", // the .cfd farm and redpaper.info, 11/22
  "ip:138.197.228.18", // thechiv.com, volhoo.com, anonmart.com, bonuscable.com, dvdee.com, forims.com
  "ip:95.216.191.158", // ooynib, tanpony, lnovic, olipii, gmeenramy, ruutukf, bwmyga
  "ip:45.79.100.107", // zefvo.com
  "ip:159.203.157.224", // thinkatime.com, tipsfuel.com: random local parts, welcome credits spent on HeadSwap Pro at once (2026-11-28)
]);

/**
 * Mail providers that host many unrelated real domains (mailbox providers, Google Workspace,
 * Microsoft 365, hosting companies). Sharing one of these says nothing about a farm, so the
 * "many domains on one server" rule never counts them.
 */
export const MAJOR_MAIL_PROVIDERS: ReadonlySet<string> = new Set([
  "google.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoodns.net", "yahoo.com",
  "icloud.com", "me.com", "apple.com", "aol.com", "mail.ru", "yandex.ru", "yandex.net",
  "rambler.ru", "gmx.net", "gmx.de", "web.de", "mail.com", "t-online.de", "qq.com", "163.com",
  "126.com", "netease.com", "sina.com", "sina.cn", "aliyun.com", "naver.com", "daum.net",
  "zoho.com", "zoho.eu", "zoho.in", "zohomail.com", "protonmail.ch", "proton.me",
  "tutanota.de", "messagingengine.com", "secureserver.net", "ovh.net", "ionos.com", "ionos.de",
  "kundenserver.de", "1and1.com", "perfora.net", "hostinger.com", "titan.email",
  "registrar-servers.com", "emailsrvr.com", "cloudflare.net", "amazonaws.com", "mailgun.org",
  "pphosted.com", "mimecast.com", "barracudanetworks.com", "orange.fr", "free.fr", "sfr.fr",
  "laposte.net", "libero.it", "seznam.cz", "o2.pl", "wp.pl", "interia.pl", "comcast.net",
  "att.net", "verizon.net", "ukr.net", "rediffmail.com", "larksuite.com", "feishu.cn",
  "zoho.com.cn", "kasserver.com", "eco-mx.cz", "tlen.pl", "fortimailcloud.com", "duck.com",
]);

const resolver = new dns.Resolver({ timeout: 1500, tries: 2 });

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

const cache = new Map<string, { key: string | null; at: number }>();
const CACHE_MS = 6 * 60 * 60 * 1000;

/**
 * Provider key for an email domain, or null when it cannot be told (no MX, DNS error, timeout).
 * Never throws: a lookup that fails must not cost anyone their credits.
 */
export async function mailProviderOf(emailDomain: string): Promise<string | null> {
  const domain = emailDomain.trim().toLowerCase();
  if (!domain) return null;
  const hit = cache.get(domain);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.key;

  let key: string | null = null;
  try {
    const mx = await withTimeout(resolver.resolveMx(domain), 3000);
    const main = mx.sort((a, b) => a.priority - b.priority)[0]?.exchange?.toLowerCase().replace(/\.$/, "");
    if (main) {
      const provider = registrableDomain(main);
      if (provider === registrableDomain(domain)) {
        // Self-hosted: the machine is the fingerprint.
        const ips = await withTimeout(resolver.resolve4(main), 3000).catch(() => [] as string[]);
        key = ips.length ? `ip:${[...ips].sort()[0]}` : null;
        if (ips.some((ip) => TEMP_MAIL_PROVIDERS.has(`ip:${ip}`))) {
          key = `ip:${ips.find((ip) => TEMP_MAIL_PROVIDERS.has(`ip:${ip}`))}`;
        }
      } else {
        key = provider;
      }
    }
  } catch {
    key = null;
  }
  cache.set(domain, { key, at: Date.now() });
  return key;
}
