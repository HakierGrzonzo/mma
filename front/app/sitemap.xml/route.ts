// See https://github.com/vercel/next.js/issues/59136#issuecomment-1938195038

import { PAGE_URL } from "@/constants";
import { sortComicMetadata } from "@/hooks";
import { getAllMetadata } from "@/utils";
import { MetadataRoute } from "next";

async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  const rawMetadata = await getAllMetadata();
  const metadata = sortComicMetadata(rawMetadata, "name");
  return [
    {
      url: `${PAGE_URL}/`,
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    ...(metadata.map((m) => {
      const isOneshot = m.series.comics.length === 1;
      return {
        url: `${PAGE_URL}/comic/${m.series.id}`,
        lastModified: m.series.comics[0].uploaded_at,
        changeFrequency: isOneshot ? "monthly" : "weekly",
        priority: 0.5,
      };
    }) as MetadataRoute.Sitemap),
  ];
}

function getDateInUtc(timestamp: Date | string | undefined) {
  if (timestamp === undefined) {
    return new Date().toISOString();
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp).toISOString();
  }
  return timestamp.toISOString();
}

export async function GET() {
  const data = await getSitemap();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    ${data
      .map(
        (item) => `
            <url>
              <loc>${item.url}</loc>
              <lastmod>${getDateInUtc(item.lastModified)}</lastmod>
              <changefreq>${item.changeFrequency ?? "daily"}</changefreq>
              <priority>${item.priority ?? 1}</priority>
            </url>
          `,
      )
      .join("")}
    </urlset>
  `;
  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
