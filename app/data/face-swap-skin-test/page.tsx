import { SkinTestPage, skinTestMetadata } from "./skin-test-page";

// The English skin-texture test. Layout and figures: ./skin-test-page.tsx; words: ./copy.tsx; Portuguese at /pt-BR/data/face-swap-skin-test.

export const metadata = skinTestMetadata("en");

export default function SkinTestPageEn() {
  return <SkinTestPage locale="en" />;
}
