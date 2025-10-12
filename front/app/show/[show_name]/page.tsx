import Header from "@/components/Header";
import { MetaTable } from "@/components/MetaTable";
import { PAGE_URL } from "@/constants";
import { db, getMetaTableDataForShow, getMetaTableDataForTag } from "@/db";
import { deNormalizeSlash, normalizeSlash } from "@/tags";
import { getImageUrl } from "@/utils";
import { Metadata } from "next";
import { env } from "process";

export async function generateStaticParams() {
  const shows = db
    .prepare(
      `
      SELECT DISTINCT
        comic_series.show as show
      FROM 
        comic_series
    `,
    )
    .all() as { show: string }[];
  if (env.NODE_ENV !== "production") {
    return shows.map((show) => ({
      show_name: encodeURIComponent(show.show),
    }));
  }
  // Encoding/Dencoding is done by nginx
  return shows.map((show) => ({
    show_name: show.show,
  }));
}

type Params = { params: { show_name: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { show_name } = params;
  const showName = deNormalizeSlash(decodeURIComponent(show_name));
  const someImage = db
    .prepare(
      `
    SELECT
      image.file_path as file_path
    FROM
      comic_series
    JOIN
      comic
      ON
        comic.series = comic_series.id
    JOIN 
      image
      ON
        comic.id = image.comic
    WHERE
      comic_series.show = ?
    ORDER BY
      comic.uploaded_at,
      image."order"
`,
    )
    .get(showName) as { file_path: string };

  const numberOfComics = db
    .prepare(
      `
    SELECT
      COUNT(comic_series.id) as length
    FROM
      comic_series
    WHERE
      comic_series.show = ?
`,
    )
    .get(showName) as { length: number };

  const imageUrl = someImage && getImageUrl(someImage);
  const description = `A list of MoringMark's ${numberOfComics.length} comics and fanworks from "${showName}"`;
  return {
    title: showName,
    openGraph: {
      type: "website",
      title: showName,
      description,
      siteName: "MoringMark Archive",
      images: imageUrl && [imageUrl],
    },
    description,
    alternates: {
      canonical: `${PAGE_URL}/show/${show_name}/`,
    },
    metadataBase: new URL(PAGE_URL),
  };
}

export default async function TagsList({ params }: Params) {
  const { show_name } = params;
  const showName = deNormalizeSlash(decodeURIComponent(show_name));

  const rows = getMetaTableDataForShow(showName);
  return (
    <>
      <Header />
      <section>
        <h1>{showName}</h1>
        <MetaTable rows={rows} />
      </section>
    </>
  );
}
