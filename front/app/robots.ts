import { PAGE_URL } from "@/constants";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/random",
      },
    ],
    sitemap: `${PAGE_URL}/sitemap.xml`,
  };
}
