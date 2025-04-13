import Header from "@/components/Header";
import { Search } from "@/components/search";
import { SqliteProvider } from "@/components/SqliteContext";

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
