import { PAGE_URL } from "@/constants";
import { useComicMetadata } from "@/hooks";
import { getAllMetadata, getImageUrl } from "@/utils";
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
    const firstImageLink = comic.series.comics[0].image_urls[0];
    const firstImage = comic.images[firstImageLink];
    const articleImageLink = getImageUrl(firstImage);
    const description = firstImage.ocr || "A Comic";
    feed.item({
      title: comic.series.title,
      description,
      url: `${PAGE_URL}/comic/${comic.series.id}`,
      categories: [],
      author: "u/makmark",
      date: comic.latest_episode.toUTCString(),
      enclosure: {
        url: articleImageLink as string,
      },
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
