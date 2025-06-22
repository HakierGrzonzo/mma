"use client";
import Link from "next/link";
import classes from "./search.module.css";
import { useSqlQuery } from "./SqliteContext";
import { usePathname, useSearchParams } from "next/navigation";
import { getSubmissionLinks } from "@/utils";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

export function Search() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const pathname = usePathname();
  const [debouncedQuery] = useDebounce(query, 300);
  const pattern = `%${debouncedQuery}%`;
  useEffect(() => {
    const encoded = encodeURIComponent(debouncedQuery);
    history.replaceState(null, "", `${pathname}?query=${encoded}`);
  }, [debouncedQuery, pathname]);
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
      LIMIT 200
      ;
    `,
    [pattern, pattern],
  );
  return (
    <section className={classes.container}>
      <h1>Search</h1>
      <div className={classes.search}>
        <input
          value={query}
          type="search"
          placeholder="Type to search for comics"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query === "" ? (
        <p>Start typing to see results</p>
      ) : result.length === 0 ? (
        <div>
          <h3>No comics contain this text!</h3>
          <p>
            Try using a shorter query. Consider searching for a different part
            of the comic, the OCR is not always 100% correct.
          </p>
        </div>
      ) : (
        <ul>
          {result.map((r, i) => {
            const pageUrl = `/comic/${encodeURIComponent(r.id)}`;
            const { comicLink } = getSubmissionLinks(pageUrl, r.comicTitle);
            const queryIndex = r.ocr
              .toLowerCase()
              .indexOf(debouncedQuery.toLowerCase());
            const context = 15;
            const snippetStart = r.ocr.substring(
              queryIndex - context,
              queryIndex,
            );
            const endPos = queryIndex + debouncedQuery.length;
            const snippetCenter = r.ocr.substring(queryIndex, endPos);
            const snippetEnd = r.ocr.substring(endPos, endPos + context);
            return (
              <li key={r.id}>
                <Link
                  prefetch={false}
                  target="_blank"
                  href={r.isMultipart && r.ocrMatch ? comicLink : pageUrl}
                >
                  {r.title}{" "}
                  {r.ocrMatch && r.isMultipart ? `(${r.comicTitle})` : null}
                </Link>
                {r.ocrMatch ? (
                  <span className={classes.context}>
                    - {snippetStart}
                    <span className={classes.hit}>{snippetCenter}</span>
                    {snippetEnd}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
