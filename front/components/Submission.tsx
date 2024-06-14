import classes from "./Submission.module.css";
import { Comic, Metadata, getImageUrl, getSubmissionLinks } from "../utils";
import Image from "next/image";
import { CopyToClipboard } from "./CopyToClipboard";
import Link from "next/link";

export function Submission({
  title,
  isOneshot,
  image_urls,
  link,
  uploaded_at,
  upvotes,
  pageUrl,
  isFirst,
  imageMetadata,
}: Comic & {
  isOneshot: boolean;
  isFirst: boolean;
  pageUrl: string;
  imageMetadata: Metadata["images"];
}) {
  const uploadDate = new Date(uploaded_at);
  const { idForComic, comicLink } = getSubmissionLinks(pageUrl, title);
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
              {title}
            </h2>
          </CopyToClipboard>
        )}
        <div className={classes.metadata}>
          <Link href={link}>Originally posted here</Link>
          <p>Upvotes: {upvotes}</p>
          <p>Uploaded at: {uploadDate.toDateString()}</p>
        </div>
      </div>
      {image_urls.map((img, index) => {
        const image = imageMetadata[img];
        return (
          <Image
            key={img}
            src={getImageUrl(image)}
            alt={image.ocr}
            width={image.width}
            height={image.height}
            {...(isFirst && index === 0
              ? { priority: true }
              : { loading: "lazy" })}
          />
        );
      })}
    </div>
  );
}
