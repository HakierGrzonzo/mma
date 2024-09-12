import TagLink from "@/components/TagLink";
import { getMetadataByTag, getTags } from "@/tags";

export default async function TagsList() {
  const tagmap = await getTags();
  const metadataByTag = await getMetadataByTag();
  return (
    <section>
      <h1>Browse by tags:</h1>
      <ul>
        {tagmap.tags.map((t) => (
          <li key={t.id}>
            <TagLink tag={t}>- {metadataByTag[t.id]?.length}</TagLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
