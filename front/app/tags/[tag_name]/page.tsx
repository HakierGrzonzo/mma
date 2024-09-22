import Header from "@/components/Header";
import { MetaTable } from "@/components/MetaTable";
import { PAGE_URL } from "@/constants";
import {
  deNormalizeSlash,
  getMetadataByTag,
  getTags,
  normalizeSlash,
} from "@/tags";
import { getImageUrl } from "@/utils";
import { Metadata } from "next";
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

type Params = { params: { tag_name: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag_name } = params;
  const tagName = deNormalizeSlash(decodeURIComponent(tag_name));
  const { tagsByName } = await getTags();
  const tag = tagsByName[tagName];
  const metadataByTag = await getMetadataByTag();
  const metadatas = metadataByTag[tag.id] ?? [];

  const someComicMetadata = metadatas.at(-1);
  const someImageUrl = someComicMetadata?.series.comics.at(-1)?.image_urls[0];
  const someImage = someImageUrl && someComicMetadata?.images[someImageUrl];
  const imageUrl = someImage && getImageUrl(someImage);

  return {
    title: tag.name,
    openGraph: {
      type: "website",
      title: tag.name,
      description: tag.details,
      siteName: "MoringMark Archive",
      images: imageUrl && [imageUrl],
    },
    description: `${tag.details} Tag at MoringMark Archive with ${metadatas.length} comics`,
    alternates: {
      canonical: `${PAGE_URL}/tags/${tag_name}/`,
    },
    metadataBase: new URL(PAGE_URL),
  };
}

export default async function TagsList({ params }: Params) {
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
