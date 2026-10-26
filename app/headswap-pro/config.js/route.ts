import { HEADSWAP_PRO_CREDITS_PER_IMAGE, headswapProEnabled } from "@/lib/headswap-pro";
import { gatewayBase } from "@/lib/headswap-pro-server";

export const dynamic = "force-dynamic";

/**
 * /headswap-pro/config.js: the settings the HeadSwap Pro page reads, written from the deployment's
 * own environment so the gateway address is never hard-coded into a file in the repository.
 * While the feature is off the gateway address is empty and the page says it is not open yet.
 */
export function GET() {
  const base = headswapProEnabled() ? gatewayBase() ?? "" : "";
  const js =
    `window.HS_API_BASE=${JSON.stringify(base)};` +
    `window.HS_PRICING_URL="/credits";` +
    `window.HS_CREDITS_PER_IMAGE=${HEADSWAP_PRO_CREDITS_PER_IMAGE};` +
    `window.HS_GET_ENTITLEMENT=async()=>{try{const r=await fetch("/api/headswap/token",{credentials:"include"});return r.ok?await r.text():""}catch(e){return ""}};`;
  return new Response(js, {
    headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-store" },
  });
}
