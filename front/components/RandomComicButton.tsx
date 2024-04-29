"client component";
import Link from "next/link";
import { SeriesMetadata, getRandomItem } from "../utils";

export function RandomComicButton({
  metadata,
}: {
  metadata: SeriesMetadata[];
}) {
  const randomComic = getRandomItem(metadata);
  return (
    <Link href={`/comic/${encodeURIComponent(randomComic.directory_name)}`}>
      Random Comic
    </Link>
  );
}
