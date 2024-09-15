import { Metadata } from "../types";

const RANDOM_HOST =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8080";

export function RandomComicButton({
  currentComic,
}: {
  currentComic?: Metadata;
}) {
  const exceptText =
    currentComic === undefined ? "" : `?except=${currentComic.series.id}`;
  return <a href={`${RANDOM_HOST}/random${exceptText}`}>Random Comic</a>;
}
