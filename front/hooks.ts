import { Metadata } from "./types";

type DeserializedMetadata = Omit<Metadata, "latest_episode"> & {
  latest_episode: Date;
  upvotes_total: number;
};

const filterFunctions: Record<
  string,
  (a: DeserializedMetadata, b: DeserializedMetadata) => number
> = {
  name: (a, b) => a.series.title.localeCompare(b.series.title),
  upvote: (a, b) => b.upvotes_total - a.upvotes_total,
  upload: (a, b) => b.latest_episode.valueOf() - a.latest_episode.valueOf(),
  firstUploaded: (a, b) =>
    new Date(a.series.comics.at(-1)?.uploaded_at ?? "").valueOf() -
    new Date(b.series.comics.at(-1)?.uploaded_at ?? "").valueOf(),
} as const;

export type Filters = keyof typeof filterFunctions;
export type Direction = "asc" | "dsc";

export function sortComicMetadata(
  rawMetadatas: Metadata[],
  sortMethod: Filters,
  sortDirection: Direction = "asc",
) {
  const data = rawMetadatas.map((item) => {
    return {
      ...item,
      latest_episode: new Date(item.series.comics[0].uploaded_at),
      upvotes_total: item.series.comics.reduce(
        (sum, comic) => sum + comic.upvotes,
        0,
      ),
    } as DeserializedMetadata;
  });

  const filter = filterFunctions[sortMethod];
  const directedFilter =
    sortDirection === "asc"
      ? filter
      : (a: DeserializedMetadata, b: DeserializedMetadata) => filter(b, a);

  const sortedData = data.sort(directedFilter);
  return sortedData;
}
