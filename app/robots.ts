import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://floweros-next.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/media-content",
        "/customer-participation",
        "/customer-requests",
        "/farm-furrow",
        "/field-journal",
        "/harvest-delivery",
        "/ai-draft-storybook",
        "/channel-management",
        "/settings",
        "/admin",
        "/login",
        "/unauthorized",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
