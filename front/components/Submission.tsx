import classes from "./Submission.module.css";
import { Comic, Metadata, getImageUrl } from "../utils";
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
  imageMetadata
}: Comic & {
  isOneshot: boolean;
  isFirst: boolean;
  pageUrl: string;
  imageMetadata: Metadata["images"]
}) {
  const uploadDate = new Date(uploaded_at);
  const idForSubmission = encodeURIComponent(title);
  const submissionLink = `${pageUrl}#${idForSubmission}`;
  return (
    <div className={classes.submission}>
      <div className={classes.metadataContainer}>
        {!isOneshot && (
          <CopyToClipboard text={submissionLink}>
            <h2
              id={idForSubmission}
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
        const image = imageMetadata[img]
        return (
        <Image
          key={img}
          src={getImageUrl(image)}
          alt={image.ocr}
          width={image.width}
          height={image.height}
          {...(isFirst && index === 0 ? {priority: true} : {loading: "lazy"})}
        />
      )})}
    </div>
  );
}
