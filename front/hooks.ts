import { Metadata } from "./types";
import { MetaTableRow } from "./types/db";

type DeserializedMetadata = Omit<Metadata, "latest_episode"> & {
  latest_episode: Date;
  upvotes_total: number;
};

const filterFunctions: Record<
  string,
  (a: MetaTableRow, b: MetaTableRow) => number
> = {
  name: (a, b) => a.title.localeCompare(b.title),
  upvote: (a, b) => b.totalUpvotes - a.totalUpvotes,
  upload: (a, b) => b.lastEpisode.valueOf() - a.lastEpisode.valueOf(),
} as const;

export type Filters = keyof typeof filterFunctions;
export type Direction = "asc" | "dsc";

export function sortComicMetadata(
  data: MetaTableRow[],
  sortMethod: Filters,
  sortDirection: Direction = "asc",
) {
  const filter = filterFunctions[sortMethod];
  const directedFilter =
    sortDirection === "asc"
      ? filter
      : (a: MetaTableRow, b: MetaTableRow) => filter(b, a);

  const sortedData = data.toSorted(directedFilter);
  return sortedData;
}
