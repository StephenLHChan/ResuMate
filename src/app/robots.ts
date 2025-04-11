import { type MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/", "/_next/", "/private/", "/admin/"],
  },
  sitemap: "https://resumate.app/sitemap.xml",
});

export default robots;
