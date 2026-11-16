import { HeadSwapPage, headSwapMetadata } from "../components/head-swap-page";

export const metadata = headSwapMetadata("en");

export default function Page() {
  return <HeadSwapPage lang="en" />;
}
