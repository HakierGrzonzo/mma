import TagLink from "@/components/TagLink";
import classes from "./page.module.css";
import Header from "@/components/Header";
import { Metadata } from "next";
import { PAGE_URL } from "@/constants";
import { db } from "@/db";

export const metadata: Metadata = {
  title: "List of tags",
  metadataBase: new URL(PAGE_URL),
  description:
    "A list of moringmark comics, categorized by ships, characters and other tags",
  alternates: {
    canonical: `${PAGE_URL}/tags/`,
  },
  openGraph: {
    type: "website",
    title: "List of tags - MoringMark archive",
    description:
      "A list of moringmark comics, categorized by ships, characters and other tags",
    images: {
      url: `${PAGE_URL}/assets/cover.webp`,
    },
  },
};

export default async function TagsList() {
  const tags = db
    .prepare(
      `
    SELECT
      tag.id as id,
      tag.name as name,
      tag.description as description,
      COUNT(comic_series.id) as number_of_comics
    FROM 
      tag
    JOIN 
      comic_series_tag
      ON 
        comic_series_tag.tag = tag.id
    JOIN 
      comic_series
      ON 
        comic_series_tag.comic_series = comic_series.id
    GROUP BY
      tag.id
    HAVING
      number_of_comics > 1
    ORDER BY
      number_of_comics DESC
    `,
    )
    .all() as {
    id: number;
    name: string;
    number_of_comics: number;
    description: string | null;
  }[];

  return (
    <>
      <Header />
      <section>
        <h2>List of tags:</h2>
        <ul className={classes.tagList}>
          {tags.map((t, i) => (
            <li key={t.id}>
              <TagLink prefetch={i < 6} tag={t}>
                - {t.number_of_comics}
              </TagLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
