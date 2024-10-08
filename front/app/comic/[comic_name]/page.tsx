import classes from "./page.module.css";
import { Submission } from "@/components/Submission";
import { PAGE_URL } from "@/constants";
import {
  getAllMetadata,
  getComicDescrtiptionFromAltText,
  getImageUrl,
  getSpecificMetadata,
} from "@/utils";
import { getSeriesTitle } from "@/clientUtils";
import { Metadata } from "next";
import Link from "next/link";
import { env } from "process";
import { getTags } from "@/tags";
import TagLink from "@/components/TagLink";
import Header from "@/components/Header";
import BingeButtons from "@/components/BingeButtons";

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
  const { tagsById } = await getTags();

  const seriesTitle = getSeriesTitle(metadata.series);
  const imageUrls = metadata.series.comics.flatMap((sub) => {
    const images = sub.image_urls.map((url) => metadata.images[url]);
    return images.map(getImageUrl);
  });

  const description = getComicDescrtiptionFromAltText(metadata);

  return {
    title: `${seriesTitle} - MoringMark Archive`,
    metadataBase: new URL(PAGE_URL),
    description,
    openGraph: {
      title: `${seriesTitle} - MoringMark Archive`,
      type: "article",
      images: imageUrls,
      description,
      publishedTime: metadata.series.comics.at(-1)?.uploaded_at,
      modifiedTime: metadata.series.comics.at(0)?.uploaded_at,
      tags: metadata.tags?.map((t) => tagsById[t].name),
      authors: ["MoringMark"],
    },
    alternates: {
      canonical: `${PAGE_URL}/comic/${metadata.series.id}/`,
    },
    twitter: {
      title: `${seriesTitle} - MoringMark Archive`,
      card: "summary_large_image",
      description,
      images: imageUrls,
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

  const { tagsById } = await getTags();

  const comicTags = metadata.tags?.map((t) => tagsById[t]) ?? [];

  const metadatas = await getAllMetadata();
  return (
    <>
      <Header currentComic={metadata} />
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
          <div className={classes.tagList}>
            {comicTags.map((t) => (
              <TagLink tag={t} key={t.id} />
            ))}
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
        <BingeButtons metadatas={metadatas} currentComic={metadata} />
      </section>
    </>
  );
}
