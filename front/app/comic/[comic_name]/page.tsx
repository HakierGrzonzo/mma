import classes from "./page.module.css";
import { RandomComicButton } from "@/components/RandomComicButton";
import { Submission } from "@/components/Submission";
import { PAGE_URL } from "@/constants";
import { getAllMetadata, getImageUrl, getSpecificMetadata } from "@/utils";
import { getSeriesTitle } from "@/clientUtils";
import { Metadata } from "next";
import Link from "next/link";
import { env } from "process";

export async function generateStaticParams() {
  const metadatas = await getAllMetadata();
  if (env.NODE_ENV !== "production") {
    const comic_names = metadatas.map((comic) => ({
      comic_name: encodeURIComponent(comic.series.id),
    }));
    return comic_names;
  }
  // Encoding/Dencoding is done by nginx
  const comic_names = metadatas.map((comic) => ({
    comic_name: comic.series.id,
  }));
  return comic_names;
}

export async function generateMetadata({
  params,
}: {
  params: { comic_name: string };
}): Promise<Metadata> {
  const { comic_name } = params;
  const comicName = decodeURIComponent(comic_name);
  const metadata = await getSpecificMetadata(comicName);
  const seriesTitle = getSeriesTitle(metadata.series);
  return {
    title: `${seriesTitle} - MoringMark Archive`,
    metadataBase: new URL(PAGE_URL),
    description: `${seriesTitle} Comic by u/makmark`,
    openGraph: {
      title: `${seriesTitle} - MoringMark Archive`,
      images: metadata.series.comics.flatMap((sub) => {
        const images = sub.image_urls.map((url) => metadata.images[url]);
        return images.map(getImageUrl);
      }),
      description: `${seriesTitle} Comic by u/makmark`,
      releaseDate: metadata.series.comics.at(-1)?.uploaded_at,
      modifiedTime: metadata.series.comics.at(0)?.uploaded_at,
    },
    alternates: {
      canonical: `${PAGE_URL}/comic/${metadata.series.id}`,
    },
  };
}

export default async function ComicPage({
  params,
}: {
  params: { comic_name: string };
}) {
  const { comic_name } = params;
  const comicName = decodeURIComponent(comic_name);
  const metadata = await getSpecificMetadata(comicName);
  const pageUrl = `${PAGE_URL}/comic/${comic_name}`;

  const isOneshot = metadata.series.comics.length === 1;

  const comicsInOrder = [...metadata.series.comics].reverse();

  const lastSubmissionId = encodeURIComponent(
    comicsInOrder.at(-1)?.title ?? "",
  );

  return (
    <>
      <div className={classes.stickyHeader}>
        <Link href="/">Home</Link>
        <RandomComicButton currentComic={metadata} />
      </div>
      <section>
        <div className={classes.metadatabox}>
          <h1>{getSeriesTitle(metadata.series)}</h1>
          <div className={classes.subtitleElements}>
            <p>
              Author:{" "}
              <Link href="https://www.reddit.com/user/makmark">u/makmark</Link>
            </p>
            {metadata.series.comics.length > 1 ? (
              <a href={`#${lastSubmissionId}`}>Go to last part</a>
            ) : null}
          </div>
        </div>
        {comicsInOrder.map((sub, index) => (
          <Submission
            pageUrl={pageUrl}
            key={sub.link}
            {...sub}
            isOneshot={isOneshot}
            isFirst={index === 0}
            imageMetadata={metadata.images}
          />
        ))}
      </section>
    </>
  );
}
