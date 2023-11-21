import { MetaTable } from "@/components/MetaTable";
import { getAllMetadata } from "@/utils";
import { Link } from "@nextui-org/link";

export default async function Home() {
  const metadatas = await getAllMetadata()
	return (
		<section className="flex flex-col gap-4 py-8 md:py-10">
      <h1 className="text-2xl">MoringMark archive</h1>
      <p>This page contains an archive of all MoringMark comics that were ever posted to <Link isExternal href="https://www.reddit.com/r/theowlhouse">r/TheOwlHouse</Link></p>
      <MetaTable metadatas={metadatas}/>
		</section>
	);
}
