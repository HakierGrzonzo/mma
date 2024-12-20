import classes from "./Submission.module.css";
import { getImageUrl, getSubmissionLinks } from "../utils";
import { Comic } from "../types";
import { CopyToClipboard } from "./CopyToClipboard";
import Link from "next/link";
import { db } from "@/db";
import type { Image as Timage } from "@/db";
import Image from "next/image";

export function Submission({
  isOneshot,
  pageUrl,
  comicId,
  isFirst,
}: {
  isOneshot: boolean;
  isFirst: boolean;
  comicId: string;
  pageUrl: string;
}) {
  const comic = db
    .prepare(
      `
    SELECT
      *
    FROM 
      comic
    WHERE
      comic.id = ?
    `,
    )
    .get(comicId) as Comic;

  const images = db
    .prepare(
      `
    SELECT
      *
    FROM 
      image
    WHERE
      image.comic = ?
    ORDER BY
      image."order"
    `,
    )
    .all(comicId) as Timage[];

  const uploadDate = new Date(comic.uploaded_at);
  const { idForComic, comicLink } = getSubmissionLinks(pageUrl, comic.title);
  return (
    <div className={classes.submission}>
      <div className={classes.metadataContainer}>
        {!isOneshot && (
          <CopyToClipboard text={comicLink}>
            <h2
              id={idForComic}
              title="Click to copy link to this part"
              className={classes.submissionHeader}
            >
              {comic.title}
            </h2>
          </CopyToClipboard>
        )}
        <div className={classes.metadata}>
          <Link href={comic.link}>Originally posted here</Link>
          <p>Upvotes: {comic.upvotes}</p>
          <p>Uploaded at: {uploadDate.toDateString()}</p>
        </div>
      </div>
      {images.map((img, index) => {
        return (
          <Image
            key={img.link}
            src={getImageUrl(img)}
            alt={img.ocr}
            width={img.width}
            height={img.height}
            {...(isFirst && index === 0
              ? { priority: true }
              : { loading: "lazy" })}
          />
        );
      })}
    </div>
  );
}
