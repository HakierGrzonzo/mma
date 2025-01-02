import { PAGE_URL } from "@/constants";
import { getSubmissionLinks } from "@/utils";
import RSS from "rss";
import { RSSdescription } from "@/components/RSSdescription";
import { db } from "@/db";

export async function GET() {
  const { renderToString } = await import("react-dom/server");
  const feed = new RSS({
    title: "MoringMarkArchive",
    feed_url: `${PAGE_URL}/feed.xml`,
    description: "An archive of MoringMark The Owl House comics",
    site_url: PAGE_URL,
    pubDate: new Date().toISOString(),
    ttl: 60, // 1 hour
  });

  const comics = db
    .prepare(
      `
    SELECT 
      comic.id as id,
      comic.title as title,
      comic.link as link,
      comic_series.id as series_id,
      comic.uploaded_at as uploaded_at
    FROM
      comic
    JOIN 
      comic_series
      ON 
        comic_series.id = comic.series
    ORDER BY
      comic.uploaded_at DESC
    LIMIT 30
    `,
    )
    .all() as {
    id: string;
    title: string;
    link: string;
    series_id: string;
    uploaded_at: string;
  }[];

  comics.forEach((comic) => {
    let description = renderToString(<RSSdescription comic={comic} />);
    const seriesLink = `${PAGE_URL}/comic/${comic.series_id}`;
    const { comicLink } = getSubmissionLinks(seriesLink, comic.title);
    feed.item({
      title: comic.title,
      description: description,
      url: comicLink,
      categories: [],
      author: "u/makmark",
      date: comic.uploaded_at,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
