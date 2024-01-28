import classes from "./page.module.css";
import { RandomComicButton } from "@/components/RandomComicButton";
import { Submission } from "@/components/Submission";
import { PAGE_URL } from "@/constants";
import {
  getAllMetadata,
  getImageSizes,
  getImageUrl,
  getOcr,
  getSpecificMetadata,
} from "@/utils";
import { Metadata } from "next";
import Link from "next/link";

export async function generateStaticParams() {
  const metadatas = await getAllMetadata();
  const env = process.env.NODE_ENV;
  if (env === "production") {
    return metadatas.map((comic) => ({
      comic_name: comic.directory_name,
    }));
  } else {
    return metadatas.map((comic) => ({
      comic_name: encodeURIComponent(comic.directory_name),
    }));
  }
}

export async function generateMetadata({
  params,
}: {
  params: { comic_name: string };
}): Promise<Metadata> {
  const { comic_name } = params;
  const comicName = decodeURIComponent(decodeURIComponent(comic_name));
  const metadata = await getSpecificMetadata(comicName);
  return {
    title: `${metadata.name} - MoringMark Archive`,
    metadataBase: new URL(PAGE_URL),
    description: `${metadata.name} Comic by u/makmark`,
    openGraph: {
      title: `${metadata.name} - MoringMark Archive`,
      images: metadata.submissions.flatMap((sub) =>
        sub.images.map(getImageUrl),
      ),
      description: `${metadata.name} Comic by u/makmark`,
      releaseDate: metadata.submissions.at(-1)?.uploaded_at,
      modifiedTime: metadata.latest_episode,
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
  const ocr = await getOcr(comicName);
  const imageSizes = await getImageSizes(comicName);

  const allComicMetadata = await getAllMetadata();
  const pageUrl = `${PAGE_URL}/comic/${comic_name}`;
  const lastSubmissionId = encodeURIComponent(
    metadata.submissions.at(-1)?.submission_title ?? '',
  );
  return (
    <>
      <div className={classes.stickyHeader}>
        <Link href="/">Home</Link>
        <RandomComicButton metadata={allComicMetadata} />
      </div>
      <section>
        <div className={classes.metadatabox}>
          <h1 className="">{metadata.name}</h1>
          <div className={classes.subtitleElements}>
            <p>
              Author:{" "}
              <Link href="https://www.reddit.com/user/makmark">u/makmark</Link>
            </p>
            {metadata.submissions.length > 1 ? (
              <a href={`#${lastSubmissionId}`}>Go to last part</a>
            ) : null}
          </div>
        </div>
        {metadata.submissions.map((sub) => (
          <Submission
            pageUrl={pageUrl}
            key={sub.link}
            {...sub}
            isSingle={metadata.submissions.length === 1}
            ocr={ocr}
            imageSizes={imageSizes}
          />
        ))}
      </section>
    </>
  );
}
