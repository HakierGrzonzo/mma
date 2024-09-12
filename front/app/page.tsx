import RSSbutton from "@/components/RSSbutton";
import classes from "./page.module.css";
import { MetaTable } from "@/components/MetaTable";
import { getAllMetadata } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";
import { PAGE_URL } from "@/constants";

export const metadata: Metadata = {
  title: "MoringMark Archive",
  metadataBase: new URL("https://moringmark.grzegorzkoperwas.site"),
  description: `An archive of all MoringMark comics about The Owl House, well most of them`,
  openGraph: {
    title: `MoringMark Archive`,
    description: `An archive of all MoringMark comics about The Owl House, well most of them`,
  },
  alternates: {
    canonical: `${PAGE_URL}`,
    types: {
      "application/rss+xml": [
        { url: `${PAGE_URL}/feed.xml`, title: "MoringMark Archive RSS" },
      ],
    },
  },
};

export default async function Home() {
  const metadatas = await getAllMetadata();
  return (
    <>
      <div className={classes.coverImage}>
        <h1 className="">MoringMark archive</h1>
        <p>
          This page contains an archive of all MoringMark comics that were ever
          posted to{" "}
          <Link href="https://www.reddit.com/r/theowlhouse">r/TheOwlHouse</Link>
        </p>
      </div>
      <section>
        <RSSbutton />
        <p>
          Browse all comics or <Link href="/tags">browse by tags.</Link>
        </p>
        <MetaTable metadatas={metadatas} />
      </section>
    </>
  );
}
