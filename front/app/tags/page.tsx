import TagLink from "@/components/TagLink";
import { getMetadataByTag, getTags, Tag } from "@/tags";
import classes from "./page.module.css";
import Header from "@/components/Header";
import { Metadata } from "next";
import { PAGE_URL } from "@/constants";

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
      url: `${PAGE_URL}/cover.webp`,
    },
  },
};

export default async function TagsList() {
  const { tags } = await getTags();
  const metadataByTag = await getMetadataByTag();
  const getNumberOfComics = (t: Tag) => metadataByTag[t.id]?.length ?? 0;
  const relevantTags = tags.filter((t) => getNumberOfComics(t) > 1);
  const sortedTags = relevantTags.sort((a, b) => {
    return getNumberOfComics(b) - getNumberOfComics(a);
  });
  return (
    <>
      <Header />
      <section>
        <h2>List of tags:</h2>
        <ul className={classes.tagList}>
          {sortedTags.map((t, i) => (
            <li key={t.id}>
              <TagLink prefetch={i < 6} tag={t}>
                - {getNumberOfComics(t)}
              </TagLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
