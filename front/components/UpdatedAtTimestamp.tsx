"use client";
import { useEffect, useState } from "react";

/**
 * @description Displays the timestamp in local timezone
 */
export default function UpdatedAtTimestamp({ now }: { now: Date }) {
  const [date, setDate] = useState<Date | null>(null);

  const formatter = new Intl.DateTimeFormat("en-UK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  useEffect(() => {
    // To avoid hydration errors we can't put the timestamp in the footer when
    // rendering html on the server
    setDate(now);
  }, [setDate, now]);

  if (date === null) {
    return null;
  }
  return <p>Updated on {formatter.format(now)}</p>;
}
