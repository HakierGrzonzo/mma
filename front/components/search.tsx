"use client";
import { useEffect, useState } from "react";
import initSqlJs, { BindParams, Database } from "sql.js";

async function loadData() {
  const sqlPromise = initSqlJs({
    locateFile: (file) => `/assets/${file}`,
  });
  const mmaSqlitePromise = fetch("/assets/mma.sqlite").then((res) =>
    res.arrayBuffer(),
  );

  const [SQL, buf] = await Promise.all([sqlPromise, mmaSqlitePromise]);
  const db = new SQL.Database(new Uint8Array(buf));
  return db;
}

function query(
  db: Database,
  statement: string,
  params: BindParams | undefined = undefined,
) {
  const { values, columns } = db.exec(statement, params)[0];
  return values.map((value) => {
    const entries = columns.map((col, i) => [col, value[i]]);
    return Object.fromEntries(entries);
  });
}

export function Search() {
  const [sqlite, setSql] = useState<Awaited<
    ReturnType<typeof loadData>
  > | null>(null);
  useEffect(() => {
    const foo = async () => {
      const sql = await loadData();
      setSql(sql);
    };
    if (sqlite === null) {
      foo();
    }
  }, [sqlite, setSql]);

  if (sqlite === null) {
    return <p>loading...</p>;
  }
  const pattern = "%grom%";
  const result = query(
    sqlite,
    "SELECT id, title FROM comic_series WHERE title LIKE ?;",
    [pattern],
  ) as { id: string; title: string }[];
  console.log(result);
  return (
    <ul>
      {result.map((r) => (
        <li key={r.id}>{r.title}</li>
      ))}
    </ul>
  );
}
