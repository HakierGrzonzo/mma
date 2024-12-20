import Database from "better-sqlite3";
import { MetaTableRow } from "./types/db";

export const db = new Database(
  "/home/hakiergrzonzo/Desktop/programy/mma/scraper/mma.sqlite",
  { readonly: true },
);

export interface ComicSeries {
  id: string;
  title: string;
}

export interface Comic {
  id: string;
  title: string;
  upvotes: number;
  link: string;
  uploaded_at: Date;
  series: string;
  prefix: string;
}

export interface Image {
  link: string;
  ocr: string;
  height: number;
  width: number;
  file_path: string;
  order: number;
  comic: string;
}

export function getMetaTableData() {
  const rows = db
    .prepare(
      `
    SELECT 
      comic_series.id as id, 
      comic_series.title as title, 
      SUM(comic.upvotes) as total_upvotes, 
      MAX(comic.uploaded_at) as last_episode
    FROM 
      comic_series 
    JOIN 
      comic 
    ON 
      comic.series = comic_series.id 
    GROUP BY 
      comic_series.title 
    ORDER BY 
      last_episode DESC;
  `,
    )
    .all() as {
    title: string;
    total_upvotes: number;
    last_episode: string;
    id: string;
  }[];

  const tableRows: MetaTableRow[] = rows.map((row) => ({
    id: row["id"],
    title: row["title"],
    totalUpvotes: row["total_upvotes"],
    lastEpisode: new Date(row["last_episode"]),
  }));
  return tableRows;
}

export function getMetaTableDataForTag(tagId: number) {
  const rows = db
    .prepare(
      `
    SELECT 
      comic_series.id as id, 
      comic_series.title as title, 
      SUM(comic.upvotes) as total_upvotes, 
      MAX(comic.uploaded_at) as last_episode
    FROM 
      comic_series 
    JOIN 
      comic 
      ON 
        comic.series = comic_series.id 
    JOIN
      comic_series_tag
      ON 
        comic_series.id = comic_series_tag.comic_series
    WHERE
      comic_series_tag.tag = ?
    GROUP BY 
      comic_series.title 
    ORDER BY 
      last_episode DESC;
  `,
    )
    .all(tagId) as {
    title: string;
    total_upvotes: number;
    last_episode: string;
    id: string;
  }[];

  const tableRows: MetaTableRow[] = rows.map((row) => ({
    id: row["id"],
    title: row["title"],
    totalUpvotes: row["total_upvotes"],
    lastEpisode: new Date(row["last_episode"]),
  }));
  return tableRows;
}
