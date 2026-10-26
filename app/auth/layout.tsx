import type { Metadata } from "next";

// Sign-in, sign-up and password pages are for people who already know where they are going, never for search results.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
