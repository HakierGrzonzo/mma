import CoverImage from "@/components/CoverImage";
import TagLink from "@/components/TagLink";
import { getMetadataByTag, getTags, Tag } from "@/tags";
import classes from "./page.module.css";
import Header from "@/components/Header";

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
