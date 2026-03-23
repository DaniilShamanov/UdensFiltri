import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const routes = [
    "",
    "/products",
    "/services",
    "/contact",
    "/cart",
    "/auth/sign-in",
    "/auth/sign-up",
    "/info/privacy",
    "/info/terms",
    "/info/cookies",
    "/info/faq",
    "/info/shipping",
    "/info/returns",
    "/info/warranty",
  ];

  const now = new Date();
  const items: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of routes) {
      items.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
      });
    }
  }

  return items;
}
