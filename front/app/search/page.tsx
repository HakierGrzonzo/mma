import Header from "@/components/Header";
import { Search } from "@/components/search";
import { SqliteProvider } from "@/components/SqliteContext";
import { Metadata } from "next";
import { PAGE_URL } from "@/constants";

export const metadata: Metadata = {
  title: "Search - MoringMark Archive",
  metadataBase: new URL(PAGE_URL),
  description:
    "A semi functional, PoC, search engine for moringmark comics. It can help you find that one comic that you want to show to your friend",
  alternates: {
    canonical: `${PAGE_URL}/search/`,
  },
  openGraph: {
    type: "website",
    title: "Search - MoringMark Archive",
    description:
      "A semi functional, PoC, search engine for moringmark comics. It can help you find that one comic that you want to show to your friend",
    images: {
      url: `${PAGE_URL}/assets/cover.webp`,
    },
  },
};

export default async function SearchPage() {
  return (
    <>
      <Header />
      <SqliteProvider>
        <Search />
      </SqliteProvider>
    </>
  );
}
