import classes from "./page.module.css";
import { Submission } from "@/components/Submission";
import { PAGE_URL } from "@/constants";
import { getImageUrl } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";
import { env } from "process";
import TagLink from "@/components/TagLink";
import Header from "@/components/Header";
import BingeButtons from "@/components/BingeButtons";
import { db } from "@/db";

export function generateStaticParams() {
  const comicSeries = db
    .prepare(
      `
    SELECT
      id 
    FROM
      comic_series
    `,
    )
    .all() as { id: string }[];
  if (env.NODE_ENV !== "production") {
    const comic_names = comicSeries.map((comic) => ({
      comic_name: encodeURIComponent(comic.id),
    }));
    return comic_names;
  }
  // Encoding/Dencoding is done by nginx
  const comic_names = comicSeries.map((comic) => ({
    comic_name: comic.id,
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
  const comicSeries = db
    .prepare(
      `
    SELECT
      comic_series.id as id,
      comic_series.title as title,
      MIN(comic.uploaded_at) as published,
      MAX(comic.uploaded_at) as modified
    FROM
      comic_series
    JOIN
      comic
      ON
        comic.series = comic_series.id
    WHERE
      comic_series.id = ?
    GROUP BY
      comic_series.id
    `,
    )
    .get(comicName) as {
    id: string;
    title: string;
    published: string;
    modified: string;
  };

  const tags = db
    .prepare(
      `
    SELECT
      tag.name as name
    FROM
      tag
    JOIN
      comic_series_tag
      ON
        comic_series_tag.tag = tag.id
    WHERE
      comic_series_tag.comic_series = ?
    `,
    )
    .all(comicSeries.id) as { name: string }[];

  const altText = db
    .prepare(
      `
    SELECT
      image.ocr as alt
    FROM
      image
    JOIN
      comic 
      ON
        image.comic = comic.id
    WHERE
      comic.series = ? AND not (image.ocr isnull)
    `,
    )
    .get(comicSeries.id) as { alt: string } | undefined;

  const images = db
    .prepare(
      `
    SELECT
      image.file_path as file_path
    FROM
      image
    JOIN
      comic 
      ON
        image.comic = comic.id
    WHERE
      comic.series = ?
    ORDER BY
      comic.uploaded_at, image."order"
    LIMIT 3
    `,
    )
    .all(comicSeries.id) as { file_path: string }[];

  const description =
    altText && altText.alt.trim().length > 10
      ? altText.alt
      : `${comicSeries.title} - Comic by MoringMark on MoringMarkArchive`;
  const imageUrls = images.map(getImageUrl);

  return {
    title: `${comicSeries.title} - MoringMarkArchive`,
    metadataBase: new URL(PAGE_URL),
    description,
    openGraph: {
      title: `${comicSeries.title} - MoringMarkArchive`,
      type: "article",
      images: imageUrls,
      description,
      publishedTime: comicSeries.published,
      modifiedTime: comicSeries.modified,
      tags: tags.map((t) => t.name),
      authors: ["MoringMark"],
    },
    alternates: {
      canonical: `${PAGE_URL}/comic/${comicSeries.id}/`,
    },
    twitter: {
      title: `${comicSeries.title} - MoringMark Archive`,
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
  const pageUrl = `${PAGE_URL}/comic/${comic_name}`;

  const comicSeries = db
    .prepare(
      `
    SELECT
      id,
      title
    FROM
      comic_series
    WHERE
      id = ?
    `,
    )
    .get(comicName) as { id: string; title: string };

  const tags = db
    .prepare(
      `
    SELECT
      tag.id as id,
      tag.name as name,
      tag.description as description
    FROM
      tag
    JOIN
      comic_series_tag
      ON
        comic_series_tag.tag = tag.id
    WHERE
      comic_series_tag.comic_series = ?
    `,
    )
    .all(comicSeries.id) as {
    id: string;
    name: string;
    description: string | null;
  }[];

  const comics = db
    .prepare(
      `
    SELECT
      id,
      title
    FROM 
      comic
    WHERE
      series = ?
    ORDER BY
      comic.uploaded_at
    `,
    )
    .all(comicSeries.id) as { id: string; title: string }[];

  const isOneshot = comics.length === 1;

  const lastSubmissionId = encodeURIComponent(comics.at(-1)?.title ?? "");

  return (
    <>
      <Header currentComicSeries={comicSeries} />
      <section>
        <div className={classes.metadatabox}>
          <h1>{isOneshot ? comics[0].title : comicSeries.title}</h1>
          <div className={classes.subtitleElements}>
            <p>
              Author:{" "}
              <Link href="https://www.reddit.com/user/makmark">u/makmark</Link>
            </p>
            {!isOneshot ? (
              <a href={`#${lastSubmissionId}`}>Go to last part</a>
            ) : null}
          </div>
          <div className={classes.tagList}>
            {tags.map((t) => (
              <TagLink tag={t} key={t.id} />
            ))}
          </div>
        </div>
        {comics.map((sub, index) => (
          <Submission
            pageUrl={pageUrl}
            key={sub.id}
            comicId={sub.id}
            isOneshot={isOneshot}
            isFirst={index === 0}
          />
        ))}
        <BingeButtons currentComicSeriesId={comicSeries.id} />
      </section>
    </>
  );
}
