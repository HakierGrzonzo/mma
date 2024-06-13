import { Metadata } from "./utils";


type DeserializedMetadata = Omit<Metadata, "latest_episode"> & {
  latest_episode: Date;
  upvotes_total: number;
};

const filterFunctions: Record<string, (a: DeserializedMetadata, b: DeserializedMetadata) => number> = {
  name: (a, b) => a.series.title.localeCompare(b.series.title),
  upvote: (a, b) => b.upvotes_total - a.upvotes_total,
  upload: (a, b) => b.latest_episode.valueOf() - a.latest_episode.valueOf(),
};

export type Filters = keyof typeof filterFunctions;

export function useComicMetadata(rawMetadatas: Metadata[], sortMethod: Filters) {
  const data = rawMetadatas.map((item) => {
    return {
      ...item,
      latest_episode: new Date(item.series.comics[0].uploaded_at),
      upvotes_total: item.series.comics.reduce((sum, comic) => sum + comic.upvotes, 0)
    } as DeserializedMetadata
  });

  const sortedData = data.sort(filterFunctions[sortMethod]);
  return sortedData
}
