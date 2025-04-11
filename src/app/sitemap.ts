import { type MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: "https://resumate.app",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: "https://resumate.app/login",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "https://resumate.app/register",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "https://resumate.app/dashboard",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
];

export default sitemap;
