"use client";
import Link from "next/link";
import classes from "./search.module.css";
import { useSqlQuery } from "./SqliteContext";
import { usePathname, useSearchParams } from "next/navigation";
import { getSubmissionLinks } from "@/utils";

export function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get("query") || "";
  const setQuery = (value: string) => {
    const encoded = encodeURIComponent(value);
    history.replaceState(null, "", `${pathname}?query=${encoded}`);
  };
  const pattern = `%${query}%`;
  const result = useSqlQuery<{
    id: string;
    title: string;
    ocr: string;
    titleMatch: boolean;
    ocrMatch: boolean;
    comicTitle: string;
    isMultipart: boolean;
  }>(
    `SELECT
        comic_series.id AS id,
        comic_series.title AS title,
        comic_series.title LIKE ? as titleMatch,
        comic.title as comicTitle,
        (SELECT COUNT(*) > 1 FROM comic WHERE series = comic_series.id) as isMultipart,
        image.ocr as ocr,
        image.ocr LIKE ? as ocrMatch
      FROM
        comic_series
      JOIN
        comic
        ON comic.series = comic_series.id
      JOIN 
        image
        ON image.comic = comic.id
      WHERE
        titleMatch
        OR 
        ocrMatch
      GROUP BY comic_series.id
      ;
    `,
    [pattern, pattern],
  );
  return (
    <section className={classes.container}>
      <h1>Search</h1>
      <input
        className={classes.search}
        value={query}
        type="search"
        placeholder="Type to search for comics"
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {result.map((r) => {
          const { comicLink } = getSubmissionLinks(
            `/comic/${encodeURIComponent(r.id)}`,
            r.comicTitle,
          );
          return (
            <li key={r.id}>
              <Link title={r.ocrMatch ? r.ocr : undefined} href={comicLink}>
                {r.title}{" "}
                {r.ocrMatch && r.isMultipart ? `(${r.comicTitle})` : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
