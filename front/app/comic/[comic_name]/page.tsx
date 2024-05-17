import classes from "./page.module.css";
import { RandomComicButton } from "@/components/RandomComicButton";
import { Submission } from "@/components/Submission";
import { PAGE_URL } from "@/constants";
import { getAllMetadata, getImageUrl, getSpecificMetadata } from "@/utils";
import { Metadata } from "next";
import Link from "next/link";

export async function generateStaticParams() {
  const metadatas = await getAllMetadata();
  const comic_names = metadatas.map((comic) => ({
    comic_name: encodeURIComponent(comic.series.id),
  }));
  console.log(comic_names);
  return comic_names;
}

export async function generateMetadata({
  params,
}: {
  params: { comic_name: string };
}): Promise<Metadata> {
  const { comic_name } = params;
  const comicName = decodeURIComponent(comic_name);
  const metadata = await getSpecificMetadata(comicName);
  return {
    title: `${metadata.series.title} - MoringMark Archive`,
    metadataBase: new URL(PAGE_URL),
    description: `${metadata.series.title} Comic by u/makmark`,
    openGraph: {
      title: `${metadata.series.title} - MoringMark Archive`,
      images: metadata.series.comics.flatMap((sub) => {
        const images = sub.image_urls.map((url) => metadata.images[url]);
        return images.map(getImageUrl);
      }),
      description: `${metadata.series.title} Comic by u/makmark`,
      releaseDate: metadata.series.comics.at(-1)?.uploaded_at,
      modifiedTime: metadata.series.comics.at(0)?.uploaded_at,
    },
  };
}

export default async function ComicPage({
  params,
}: {
  params: { comic_name: string };
}) {
  const { comic_name } = params;
  const comicName = decodeURIComponent(comic_name);
  const metadata = await getSpecificMetadata(comicName);

  const allComicMetadata = await getAllMetadata();
  const pageUrl = `${PAGE_URL}/comic/${comic_name}`;
  const lastSubmissionId = encodeURIComponent(
    metadata.series.comics.at(-1)?.title ?? "",
  );

  const isOneshot = metadata.series.comics.length != 1;

  return (
    <>
      <div className={classes.stickyHeader}>
        <Link href="/">Home</Link>
        <RandomComicButton metadata={allComicMetadata} />
      </div>
      <section>
        <div className={classes.metadatabox}>
          <h1 className="">{metadata.series.title}</h1>
          <div className={classes.subtitleElements}>
            <p>
              Author:{" "}
              <Link href="https://www.reddit.com/user/makmark">u/makmark</Link>
            </p>
            {metadata.series.comics.length > 1 ? (
              <a href={`#${lastSubmissionId}`}>Go to last part</a>
            ) : null}
          </div>
        </div>
        {metadata.series.comics.map((sub, index) => (
          <Submission
            pageUrl={pageUrl}
            key={sub.link}
            {...sub}
            isOneshot={isOneshot}
            isFirst={index === 0}
            imageMetadata={metadata.images}
          />
        ))}
      </section>
    </>
  );
}
