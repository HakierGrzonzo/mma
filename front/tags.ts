import { Metadata } from "./types";
import { getAllMetadata, readJsonFile } from "./utils";

export interface Tag {
  name: string;
  id: number;
  details?: string;
}

export async function getTags() {
  const tags = await readJsonFile<Tag[]>("tags.json");
  const tagsById = Object.fromEntries(tags.map((t) => [t.id, t]));
  const tagsByName = Object.fromEntries(tags.map((t) => [t.name, t]));
  return {
    tags,
    tagsById,
    tagsByName,
  };
}

export async function getMetadataByTag() {
  const metadata = await getAllMetadata();
  const metadataTagPairs = metadata.flatMap((m) => {
    if (m.tags === undefined) {
      return [];
    }
    return m.tags.map((t) => [t, m] as [number, Metadata]);
  });
  const tagIdToMetadata = metadataTagPairs.reduce(
    (acc, [tagId, meta]) => {
      const coughtMetas = acc[tagId] || [];
      acc[tagId] = [...coughtMetas, meta];
      return acc;
    },
    {} as Record<number, Metadata[]>,
  );
  return tagIdToMetadata;
}

export function normalizeSlash(tag: { name: string }) {
  return tag.name.replaceAll("/", "|");
}
export function deNormalizeSlash(tagName: string) {
  return tagName.replaceAll("|", "/");
}
