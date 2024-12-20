// See https://github.com/vercel/next.js/issues/59136#issuecomment-1938195038

import { PAGE_URL } from "@/constants";
import { db } from "@/db";
import { normalizeSlash } from "@/tags";
import { MetadataRoute } from "next";

async function getSitemapForTags(): Promise<MetadataRoute.Sitemap> {
  const newestTagId = db
    .prepare(
      `
    SELECT 
      MAX(tag.id) * 1000 as id
    FROM 
      tag;
 `,
    )
    .get() as { id: number };

  const tags = db
    .prepare(
      `
    SELECT 
      tag.id as id,
      tag.name as name,
      MAX(comic.uploaded_at) as lastcomic
    FROM 
      tag
    JOIN 
      comic_series_tag
      ON 
         comic_series_tag.tag = tag.id
    JOIN 
      comic_series
      ON 
         comic_series_tag.comic_series = comic_series.id
    JOIN 
      comic 
      ON 
         comic_series.id = comic.series
    GROUP BY 
      tag.id;
  `,
    )
    .all() as { id: number; name: string; lastcomic: string }[];

  return [
    {
      url: `${PAGE_URL}/tags/`,
      changeFrequency: "monthly",
      lastModified: new Date(newestTagId.id),
      priority: 1,
    },
    ...(tags
      .map((t) => {
        return {
          url: `${PAGE_URL}/tags/${normalizeSlash(t)}/`,
          lastModified: new Date(t.lastcomic),
          priority: 0.7,
          changeFrequency: "weekly",
        };
      })
      .filter((v) => v !== undefined) as MetadataRoute.Sitemap),
  ];
}

async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = db
    .prepare(
      `
    SELECT 
      comic_series.id as id, 
      MAX(comic.uploaded_at) as last_episode,
      COUNT(comic.id) > 1 as is_oneshot
    FROM 
      comic_series 
    JOIN 
      comic 
    ON 
      comic.series = comic_series.id 
    GROUP BY 
      comic_series.title 
    ORDER BY 
      last_episode DESC;
  `,
    )
    .all() as { id: string; last_episode: string; is_oneshot: number }[];

  const comicsInSitemap = rows.map((row) => ({
    id: row.id,
    lastEpisode: new Date(row.last_episode),
    isOneshot: row.is_oneshot > 0,
  }));

  return [
    {
      url: `${PAGE_URL}/`,
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    ...(comicsInSitemap.map((comic) => {
      return {
        url: `${PAGE_URL}/comic/${comic.id}/`,
        lastModified: comic.lastEpisode,
        changeFrequency: comic.isOneshot ? "weekly" : "monthly",
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
  const seriesData = await getSitemap();
  const tagData = await getSitemapForTags();
  const data = [...seriesData, ...tagData];
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
