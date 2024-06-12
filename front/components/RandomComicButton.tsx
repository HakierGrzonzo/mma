import { Metadata } from "../utils";

const RANDOM_HOST = process.env.NODE_ENV === "production" ? '' : 'http://localhost:8080'

export function RandomComicButton({currentComic}: {currentComic: Metadata}) {
  return (
    <a href={`${RANDOM_HOST}/random?except=${currentComic.series.id}`}>
      Random Comic
    </a>
  );
}
