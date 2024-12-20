import { sortComicMetadata } from "@/hooks";
import { Comic, Metadata } from "@/types";
import Link from "next/link";
import classes from "./BingeButtons.module.css";
import { ComicSeries, db } from "@/db";

interface Props {
  currentComicSeriesId: string;
}

export default function BingeButtons({ currentComicSeriesId }: Props) {
  const previousComic = db
    .prepare(
      `
    SELECT 
      comic_series.id
    FROM
      comic_series
    JOIN
      comic
      ON
        comic.series = comic_series.id
    GROUP BY
      comic_series.id
    HAVING
      MIN(comic.uploaded_at) < (
        SELECT
          MIN(comic.uploaded_at)
        FROM
          comic
        WHERE 
          comic.series = ?
      )
    ORDER BY
      MIN(comic.uploaded_at) DESC
    `,
    )
    .get(currentComicSeriesId) as ComicSeries | undefined;

  const nextComic = db
    .prepare(
      `
    SELECT 
      comic_series.id
    FROM
      comic_series
    JOIN
      comic
      ON
        comic.series = comic_series.id
    GROUP BY
      comic_series.id
    HAVING
      MIN(comic.uploaded_at) > (
        SELECT
          MIN(comic.uploaded_at)
        FROM
          comic
        WHERE 
          comic.series = ?
      )
    ORDER BY
      MIN(comic.uploaded_at) ASC
    `,
    )
    .get(currentComicSeriesId) as ComicSeries | undefined;

  const comicButton = (comicSeries: ComicSeries, text: string) => (
    <Link
      href={`/comic/${encodeURIComponent(comicSeries.id)}/`}
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
