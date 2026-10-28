import { HeadSwapLaunchPage, headswapMetadata } from "./launch-page";

// The English launch page. The layout is in ./launch-page.tsx and the words in ./copy.ts; translations live at
// /zh-CN/headswap-pro and /ja/headswap-pro (app/[locale]/headswap-pro/page.tsx).

export const metadata = headswapMetadata("en");

export default function HeadSwapProPage() {
  return <HeadSwapLaunchPage locale="en" />;
}
