import RSSbutton from "@/components/RSSbutton";
import { MetaTable } from "@/components/MetaTable";
import { Metadata } from "next";
import Link from "next/link";
import { PAGE_URL } from "@/constants";
import CoverImage from "@/components/CoverImage";
import { getMetaTableData } from "@/db";

export const metadata: Metadata = {
  title: "MoringMark Archive",
  metadataBase: new URL(PAGE_URL),
  description: `An archive of all MoringMark comics about The Owl House, well most of them`,
  openGraph: {
    type: "website",
    title: `MoringMark Archive`,
    description: `An archive of all MoringMark comics about The Owl House, well most of them`,
    images: {
      url: `${PAGE_URL}/cover.webp`,
    },
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
  const data = getMetaTableData();
  return (
    <>
      <CoverImage>
        <p>
          This page contains an archive of all MoringMark comics that were ever
          posted to{" "}
          <Link href="https://www.reddit.com/r/theowlhouse">r/TheOwlHouse</Link>
        </p>
      </CoverImage>
      <section>
        <p style={{ fontSize: "120%" }}>
          Browse all comics or <Link href="/tags">browse by tags.</Link>
        </p>
        <RSSbutton />
        <MetaTable rows={data} />
      </section>
    </>
  );
}
