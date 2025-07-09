import classes from "./Submission.module.css";
import { getImageUrl, getSubmissionLinks } from "../utils";
import { Comic } from "../types";
import { CopyToClipboard } from "./CopyToClipboard";
import Link from "next/link";
import { db } from "@/db";
import type { Image as Timage } from "@/db";
import Image from "next/image";

type Special = Record<string, JSX.Element>;

const specialHeaders: Special = {
  "1i8w04h": (
    <p className={classes.special}>
      <a href="/comic/Luzifer%20AU%20tumblr/">Tumblr timeline</a> merges here.
    </p>
  ),
  "1h1wjv6alt": (
    <p className={classes.special}>
      Continues from{" "}
      <a href="/comic/Luzifer%20AU#Luzifer%20AU%3A%20Decision%20/">
        the main timeline.
      </a>
    </p>
  ),
};

const specialFooters: Special = {
  "1hy4zx9alt": (
    <p className={classes.special}>
      Continues in the{" "}
      <a href="/comic/Luzifer%20AU#Luzifer%20AU%3A%20First%20Meet/">
        main timeline.
      </a>
    </p>
  ),
  "1guxrlu": (
    <p className={classes.special}>
      <a href="/comic/Luzifer AU tumblr/">Alternative tumblr timeline</a> splits
      here!
    </p>
  ),
  "1j08araalt": (
    <p className={classes.special}>
      The rest of hunter is stuck in{" "}
      <a href="/comic/Luzifer%20AU#Luzifer%20AU%3A%20Phantom%20Limb/">
        the main timeline.
      </a>
    </p>
  ),
  "1j08ara": (
    <p className={classes.special}>
      Luz and hunter&apos;s hand goes to{" "}
      <a href="/comic/Luzifer%20AU%20tumblr#Luzifer%20AU%3A%20Phantom%20Limb%20-%20Alternative%20Timeline/">
        the tumblr timeline.
      </a>
    </p>
  ),
};

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
      {specialHeaders[comicId] ?? null}
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
      {specialFooters[comicId] ?? null}
    </div>
  );
}
