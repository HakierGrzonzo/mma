import RSSbutton from "@/components/RSSbutton";
import { MetaTable } from "@/components/MetaTable";
import { getAllMetadata } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";
import { PAGE_URL } from "@/constants";
import CoverImage from "@/components/CoverImage";

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
      <CoverImage>
        <p>
          This page contains an archive of all MoringMark comics that were ever
          posted to{" "}
          <Link href="https://www.reddit.com/r/theowlhouse">r/TheOwlHouse</Link>
        </p>
      </CoverImage>
      <section>
        <p style={{ ["font-size"]: "120%" }}>
          Browse all comics or <Link href="/tags">browse by tags.</Link>
        </p>
        <RSSbutton />
        <MetaTable metadatas={metadatas} />
      </section>
    </>
  );
}
