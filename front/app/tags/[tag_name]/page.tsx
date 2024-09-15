import Header from "@/components/Header";
import { MetaTable } from "@/components/MetaTable";
import {
  deNormalizeSlash,
  getMetadataByTag,
  getTags,
  normalizeSlash,
} from "@/tags";
import { env } from "process";

export async function generateStaticParams() {
  const { tags } = await getTags();
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

export default async function TagsList({
  params,
}: {
  params: { tag_name: string };
}) {
  const { tag_name } = params;
  const tagName = deNormalizeSlash(decodeURIComponent(tag_name));
  const { tagsByName } = await getTags();
  const tag = tagsByName[tagName];
  const metadataByTag = await getMetadataByTag();
  const metadatas = metadataByTag[tag.id] ?? [];
  return (
    <>
      <Header />
      <section>
        <h1>{tag.name}</h1>
        {
          <p>
            {tag.details || "This tag does not have a description just yet"}
          </p>
        }
        <MetaTable metadatas={metadatas} />
      </section>
    </>
  );
}
