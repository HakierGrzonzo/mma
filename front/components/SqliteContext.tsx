"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
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

function makeQuery(
  db: Database,
  statement: string,
  params: BindParams | undefined = undefined,
) {
  const returned = db.exec(statement, params);
  if (returned.length !== 1) {
    return [];
  }
  const { values, columns } = returned[0];
  return values.map((value) => {
    const entries = columns.map((col, i) => [col, value[i]]);
    return Object.fromEntries(entries);
  });
}

export const SqliteContext = createContext<Database>(
  null as unknown as Database,
);

export function useSqlQuery<T>(
  query: string,
  params: BindParams | undefined = undefined,
) {
  const db = useContext(SqliteContext);
  const result = useMemo(
    () => makeQuery(db, query, params),
    [db, query, params],
  );
  return result as T[];
}

export function SqliteProvider({ children }: PropsWithChildren) {
  const [db, setDb] = useState<Database | "error" | null>(null);
  useEffect(() => {
    const foo = async () => {
      const sql = await loadData();
      setDb(sql);
    };
    if (db === null) {
      foo().catch(() => setDb("error"));
    }
  }, [db, setDb]);

  if (db === null) {
    return (
      <section>
        <p>Loading the database...</p>
      </section>
    );
  }
  if (db === "error") {
    return (
      <section>
        <h1>:-(</h1>
        <p>
          This page requires webassembly to work, or your browser does not like
          sqlite
        </p>
      </section>
    );
  }
  return <SqliteContext.Provider value={db}>{children}</SqliteContext.Provider>;
}
