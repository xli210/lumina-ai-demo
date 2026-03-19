import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free NanoPocket account to access local AI tools for image generation, video creation, face swap, and more.",
  alternates: { canonical: "/auth/sign-up" },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
