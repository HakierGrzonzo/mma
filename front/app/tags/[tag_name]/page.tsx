import Header from "@/components/Header";
import { MetaTable } from "@/components/MetaTable";
import { PAGE_URL } from "@/constants";
import { db, getMetaTableDataForTag } from "@/db";
import { deNormalizeSlash, normalizeSlash } from "@/tags";
import { getImageUrl } from "@/utils";
import { Metadata } from "next";
import { env } from "process";

export async function generateStaticParams() {
  const tags = db
    .prepare(
      `
      SELECT 
        tag.name as name
      FROM 
        tag
    `,
    )
    .all() as { name: string }[];
  const tagNames = tags.map(normalizeSlash);
  if (env.NODE_ENV !== "production") {
    return tagNames.map((tag) => ({
      tag_name: encodeURIComponent(tag),
    }));
  }
  // Encoding/Dencoding is done by nginx
  return tagNames.map((tag) => ({
    tag_name: tag,
  }));
}

type Params = { params: { tag_name: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag_name } = params;
  const tagName = deNormalizeSlash(decodeURIComponent(tag_name));
  const tag = db
    .prepare(
      `
    SELECT
      tag.name as name,
      tag.description as description,
      tag.id as id
    FROM
      tag
    WHERE
      tag.name = ?
`,
    )
    .get(tagName) as { name: string; description: string | null; id: number };
  const someImage = db
    .prepare(
      `
    SELECT
      image.file_path as file_path
    FROM
      comic_series
    JOIN 
      comic_series_tag
      ON
        comic_series_tag.comic_series = comic_series.id
    JOIN
      comic
      ON
        comic.series = comic_series.id
    JOIN 
      image
      ON
        comic.id = image.comic
    WHERE
      comic_series_tag.tag = ?
    ORDER BY
      comic.uploaded_at,
      image."order"
`,
    )
    .get(tag.id) as { file_path: string };

  const numberOfComics = db
    .prepare(
      `
    SELECT
      COUNT(comic_series.id) as length
    FROM
      comic_series
    JOIN 
      comic_series_tag
      ON
        comic_series_tag.comic_series = comic_series.id
    WHERE
      comic_series_tag.tag = ?
`,
    )
    .get(tag.id) as { length: number };

  const imageUrl = someImage && getImageUrl(someImage);

  return {
    title: tag.name,
    openGraph: {
      type: "website",
      title: tag.name,
      description: tag.description ?? undefined,
      siteName: "MoringMark Archive",
      images: imageUrl && [imageUrl],
    },
    description: `${tag.description ?? ""} Tag at MoringMark Archive with ${numberOfComics.length} comics`,
    alternates: {
      canonical: `${PAGE_URL}/tags/${tag_name}/`,
    },
    metadataBase: new URL(PAGE_URL),
  };
}

export default async function TagsList({ params }: Params) {
  const { tag_name } = params;
  const tagName = deNormalizeSlash(decodeURIComponent(tag_name));

  const tag = db
    .prepare(
      `
    SELECT
      tag.name as name,
      tag.description as description,
      tag.id as id
    FROM
      tag
    WHERE
      tag.name = ?
`,
    )
    .get(tagName) as { name: string; description: string | null; id: number };

  const rows = getMetaTableDataForTag(tag.id);
  return (
    <>
      <Header />
      <section>
        <h1>{tag.name}</h1>
        {
          <p>
            {tag.description || "This tag does not have a description just yet"}
          </p>
        }
        <MetaTable rows={rows} />
      </section>
    </>
  );
}
