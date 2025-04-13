"use client";
import { useState } from "react";
import { useSqlQuery } from "./SqliteContext";

export function Search() {
  const [query, setQuery] = useState("grom");
  const pattern = `%${query}%`;
  const result = useSqlQuery<{ id: string; title: string }>(
    `SELECT
        comic_series.id AS id,
        comic_series.title AS title
      FROM
        comic_series
      JOIN
        comic
        ON comic.series = comic_series.id
      JOIN 
        image
        ON image.comic = comic.id
      WHERE
        comic_series.title LIKE ?
        OR 
        image.ocr LIKE ?
      GROUP BY comic_series.id
      ;
    `,
    [pattern, pattern],
  );
  return (
    <div>
      <input
        value={query}
        type="search"
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {result.map((r) => (
          <li key={r.id}>
            <a href={`/comic/${encodeURIComponent(r.id)}`}>{r.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
