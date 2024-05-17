"client component";
import Link from "next/link";
import { Metadata, getRandomItem } from "../utils";

export function RandomComicButton({
  metadata,
}: {
  metadata: Metadata[];
}) {
  const randomComic = getRandomItem(metadata);
  return (
    <Link href={`/comic/${encodeURIComponent(randomComic.series.id)}`}>
      Random Comic
    </Link>
  );
}
