import { PAGE_URL } from "@/constants";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/random", "/search"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "PerplexityBot",
          "anthropic-ai",
          "Claude-Web",
          "ClaudeBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${PAGE_URL}/sitemap.xml`,
  };
}
