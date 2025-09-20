"use client";
import classes from "./metatable.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Direction, Filters, sortComicMetadata } from "@/hooks";
import { MetaTableRow } from "@/types/db";

interface Props {
  rows: MetaTableRow[];
}

export function MetaTable({ rows }: Props) {
  const [filter, setFilter] = useState<Filters>("upload");
  const [direction, setDirection] = useState<Direction>("asc");

  const [lastVisitedDate, setLastVisitedDate] = useState<null | Date>(null);
  useEffect(() => {
    try {
      const lastDate = localStorage.getItem("last-visited-date");
      if (lastVisitedDate == null && lastDate) {
        setLastVisitedDate(new Date(lastDate));
      }
      if (lastVisitedDate == null) {
        localStorage.setItem("last-visited-date", new Date().toISOString());
      }
    } catch {
      console.warn(
        "localStorage is not available in this env, skipping updating last seen",
      );
    }
  }, [lastVisitedDate]);

  const formatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sortedData = sortComicMetadata(rows, filter, direction);

  const handleFilterClick = (newFilter: Filters) => () => {
    if (newFilter === filter) {
      const newDirection = direction === "asc" ? "dsc" : "asc";
      setDirection(newDirection);
      return;
    }
    setFilter(newFilter);
    setDirection("asc");
  };

  const pillProps: Record<MetaTableRow["show"], [string, string]> = {
    "The Owl House": ["TOH", "var(--toh)"],
    "Knights of Guinevere": ["KoG", "var(--kod)"],
  };

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th></th>
          <th
            className={`${classes.first} ${
              filter === "name" && classes.active
            }`}
            onClick={handleFilterClick("name")}
          >
            Comic title
          </th>
          <th
            className={`${classes.center} ${
              filter === "upload" && classes.active
            }`}
            onClick={handleFilterClick("upload")}
          >
            Upload date
          </th>
          <th
            className={`${classes.last} ${
              filter === "upvote" && classes.active
            }`}
            onClick={handleFilterClick("upvote")}
          >
            Total upvotes
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => {
          const [pillText, pillColor] = pillProps[item.show];
          return (
            <tr key={item.id} id={item.id}>
              <td
                title={item.show}
                className={classes.show}
                style={{ backgroundColor: pillColor }}
              >
                {pillText}
              </td>
              <td>
                <Link
                  className={
                    lastVisitedDate &&
                    lastVisitedDate.valueOf() <= item.lastEpisode.valueOf()
                      ? classes.unread
                      : undefined
                  }
                  prefetch={index < 6}
                  href={`/comic/${encodeURIComponent(item.id)}/`}
                >
                  {item.title}
                </Link>
              </td>
              <td>{formatter.format(item.lastEpisode)}</td>
              <td className="text-right">{item.totalUpvotes}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
