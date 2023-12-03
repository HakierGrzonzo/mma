import { Submission } from "@/components/Submission";
import { getAllMetadata, getOcr, getSpecificMetadata } from "@/utils"
import { Link } from "@nextui-org/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  const metadatas = await getAllMetadata()
  const params = metadatas.map(comic => ({
      'comic_name': comic.directory_name,
  }))
  return params
}

export async function generateMetadata({params}: {params: {comic_name: string}}): Promise<Metadata> {
  const {comic_name} = params;
  const comicName = decodeURIComponent(decodeURIComponent(comic_name))
  const metadata = await getSpecificMetadata(comicName)
  return {
      title: `${metadata.name} - MoringMark Archive`
    }
}

export default async function ComicPage({params}: {params: {comic_name: string}}) {
  const {comic_name} = params;
  const comicName = decodeURIComponent(comic_name)
  const metadata = await getSpecificMetadata(comicName)
  const ocr = await getOcr(comicName)
  return (
    <section className="flex flex-col gap-4 py-8 md:py-10">
      <h1 className="text-2xl">{metadata.name}</h1>
      <p>Author: <Link isExternal href="https://www.reddit.com/user/makmark">u/makmark</Link></p>
      {metadata.submissions.map((sub) => <Submission key={sub.link} {...sub} isSingle={metadata.submissions.length === 1} ocr={ocr}/>)}
    </section>
  )
  }
