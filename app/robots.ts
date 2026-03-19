import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api/", "/auth/reset-password", "/auth/error", "/checkout/success"],
      },
    ],
    sitemap: "https://nanopocket.ai/sitemap.xml",
  };
}
