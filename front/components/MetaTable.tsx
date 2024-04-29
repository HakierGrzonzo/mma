"use client";
import classes from "./metatable.module.css";
import { useEffect, useState } from "react";
import { SeriesMetadata } from "../utils";
import Link from "next/link";

interface Props {
  metadatas: SeriesMetadata[];
}

type Filters = "name" | "upload" | "upvote";

type Metadata = Omit<SeriesMetadata, "latest_episode"> & {
  latest_episode: Date;
};

const filterFunctions: Record<Filters, (a: Metadata, b: Metadata) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  upvote: (a, b) => b.upvotes_total - a.upvotes_total,
  upload: (a, b) => b.latest_episode.valueOf() - a.latest_episode.valueOf(),
};

export function MetaTable({ metadatas }: Props) {
  const [filter, setFilter] = useState<Filters>("upload");
  const [lastVisitedDate, setLastVisitedDate] = useState<null | Date>(null);
  useEffect(() => {
    const lastDate = localStorage.getItem("last-visited-date");
    if (lastVisitedDate == null && lastDate) {
      setLastVisitedDate(new Date(lastDate));
    }
    if (lastVisitedDate == null) {
      localStorage.setItem("last-visited-date", new Date().toISOString());
    }
  }, [lastVisitedDate]);

  const formatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const data = metadatas.map((item) => ({
    ...item,
    latest_episode: new Date(item.latest_episode),
  }));
  const sortedData = data.sort(filterFunctions[filter]);
  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th
            className={`${classes.first} ${
              filter === "name" && classes.active
            }`}
            onClick={() => setFilter("name")}
          >
            Comic title
          </th>
          <th
            className={`${classes.center} ${
              filter === "upload" && classes.active
            }`}
            onClick={() => setFilter("upload")}
          >
            Upload date
          </th>
          <th
            className={`${classes.last} ${
              filter === "upvote" && classes.active
            }`}
            onClick={() => setFilter("upvote")}
          >
            Total upvotes
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr key={item.directory_name}>
            <td>
              <Link
                className={
                  lastVisitedDate &&
                  lastVisitedDate.valueOf() <= item.latest_episode.valueOf()
                    ? classes.unread
                    : undefined
                }
                prefetch={index < 6}
                href={`/comic/${encodeURIComponent(item.directory_name)}`}
              >
                {item.name}
              </Link>
            </td>
            <td>{formatter.format(item.latest_episode)}</td>
            <td className="text-right">{item.upvotes_total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
