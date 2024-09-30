import { sortComicMetadata } from "@/hooks";
import { Metadata } from "@/types";
import Link from "next/link";
import classes from "./BingeButtons.module.css";

interface Props {
  currentComic: Metadata;
  metadatas: Metadata[];
}

export default function BingeButtons({ metadatas, currentComic }: Props) {
  const sortedMetadatas = sortComicMetadata(metadatas, "firstUploaded");
  const thisComicIndex = sortedMetadatas.findIndex(
    (v) => v.series.id === currentComic.series.id,
  );
  const nextComic = sortedMetadatas.at(thisComicIndex + 1);
  const previousComic =
    thisComicIndex > 0 && sortedMetadatas.at(thisComicIndex - 1);

  const comicButton = (metadata: Metadata, text: string) => (
    <Link
      href={`/comic/${encodeURIComponent(metadata.series.id)}/`}
      className={classes.button}
    >
      {text}
    </Link>
  );

  return (
    <div className={classes.container}>
      {previousComic && comicButton(previousComic, "< Previous Comic")}
      {nextComic && comicButton(nextComic, "Next Comic >")}
    </div>
  );
}
