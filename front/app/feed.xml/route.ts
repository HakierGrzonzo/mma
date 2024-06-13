import { PAGE_URL } from "@/constants";
import { useComicMetadata } from "@/hooks";
import { getAllMetadata } from "@/utils";
import RSS from "rss";

export async function GET() {
  const feed = new RSS({
    title: "MoringMarkArchive",
    feed_url: `${PAGE_URL}/feed.xml`,
    description: "An archive of MoringMark The Owl House comics",
    site_url: PAGE_URL,
    pubDate: new Date().toUTCString(),
    ttl: 6 * 60, // 6 hours
  });

  const comics = await getAllMetadata();
  const orderedComics = useComicMetadata(comics, "upload");
  orderedComics.forEach((comic) => {
    feed.item({
      title: comic.series.title,
      description: "A comic",
      url: `${PAGE_URL}/comic/${comic.series.id}`,
      categories: [],
      author: "u/makmark",
      date: comic.latest_episode.toUTCString(),
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
