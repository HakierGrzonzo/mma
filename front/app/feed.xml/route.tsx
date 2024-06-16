import { PAGE_URL } from "@/constants";
import { Comic, getAllMetadata, getSubmissionLinks, Metadata } from "@/utils";
import RSS from "rss";
import { RSSdescription } from "@/components/RSSdescription";

interface ComicWithMetadata {
  comic: Comic;
  metadata: Metadata;
}

function compare(a: ComicWithMetadata, b: ComicWithMetadata) {
  const aDate = new Date(a.comic.uploaded_at);
  const bDate = new Date(b.comic.uploaded_at);
  return bDate.valueOf() - aDate.valueOf();
}

export async function GET() {
  const { renderToString } = await import("react-dom/server");
  const feed = new RSS({
    title: "MoringMarkArchive",
    feed_url: `${PAGE_URL}/feed.xml`,
    description: "An archive of MoringMark The Owl House comics",
    site_url: PAGE_URL,
    pubDate: new Date().toUTCString(),
    ttl: 6 * 60, // 6 hours
  });

  const rawMetadata = await getAllMetadata();
  const comicsWithMetadata = rawMetadata.flatMap((metadata) => {
    const { series } = metadata;
    return series.comics.map((comic) => ({ comic, metadata }));
  });
  comicsWithMetadata.sort(compare);
  comicsWithMetadata.length = 30;

  comicsWithMetadata.forEach((comicWithMetadata) => {
    const { comic, metadata } = comicWithMetadata;
    let description = renderToString(
      <RSSdescription comic={comic} metadata={metadata} />,
    );
    const seriesLink = `${PAGE_URL}/comic/${metadata.series.id}`;
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
