import { PAGE_URL } from "@/constants";
import {Comic, getAllMetadata, getImageUrl, Metadata} from "@/utils";
import RSS from "rss";

function compare(a:{comic: Comic, series: Metadata}, b:{comic: Comic, series: Metadata}) {
  if ( a.comic.uploaded_at < b.comic.uploaded_at ){
    return 1;
  }
  if ( a.comic.uploaded_at > b.comic.uploaded_at ){
    return -1;
  }
  return 0;
}

export async function GET() {
  const feed = new RSS({
    title: "MoringMarkArchive",
    feed_url: `${PAGE_URL}/feed.xml`,
    description: "An archive of MoringMark The Owl House comics",
    site_url: PAGE_URL,
    pubDate: new Date().toUTCString(),
    ttl: 6 * 60, // 6 hours
  });

  const metadata = await getAllMetadata();
  let comics : {comic: Comic, series: Metadata}[] = []
  metadata.forEach((series) => {
    Object.values(series.series.comics).forEach((comic) => {
      comics.push({comic, series})
    })
  });
  comics.sort(compare);
  comics.length = 30;

  comics.forEach((comic) => {
    let description = ""
    comic.comic.image_urls.forEach((img) => {
      const image = comic.series.images[img]
      description += '<img src="'+getImageUrl(image)+'" alt="'+image.ocr+'" width="'+image.width+'" height="'+image.height+'" />'
    })
    feed.item({
      title: comic.comic.title,
      description: description,
      url: `${PAGE_URL}/comic/${comic.series.series.id}`,
      categories: [],
      author: "u/makmark",
      date: comic.comic.uploaded_at,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
