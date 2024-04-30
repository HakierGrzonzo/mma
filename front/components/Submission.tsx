import classes from "./Submission.module.css";
import { ImageSize, OCR, SubmissionMetadata, getImageUrl } from "../utils";
import Image from "next/image";
import { CopyToClipboard } from "./CopyToClipboard";
import Link from "next/link";

export function Submission({
  submission_title,
  isSingle,
  images,
  link,
  uploaded_at,
  upvotes,
  ocr,
  imageSizes,
  pageUrl,
  isFirst
}: SubmissionMetadata & {
  isSingle: boolean;
  isFirst: boolean;
  pageUrl: string;
  ocr: OCR;
  imageSizes: ImageSize;
}) {
  const uploadDate = new Date(uploaded_at);
  const idForSubmission = encodeURIComponent(submission_title);
  const submissionLink = `${pageUrl}#${idForSubmission}`;
  return (
    <div className={classes.submission}>
      <div className={classes.metadataContainer}>
        {!isSingle && (
          <CopyToClipboard text={submissionLink}>
            <h2
              id={idForSubmission}
              title="Click to copy link to this part"
              className={classes.submissionHeader}
            >
              {submission_title}
            </h2>
          </CopyToClipboard>
        )}
        <div className={classes.metadata}>
          <Link href={link}>Originally posted here</Link>
          <p>Upvotes: {upvotes}</p>
          <p>Uploaded at: {uploadDate.toDateString()}</p>
        </div>
      </div>
      {images.map((img, index) => (
        <Image
          key={img}
          src={getImageUrl(img)}
          alt={ocr[img]}
          {...(isFirst && index === 0 ? {priority: true} : {loading: "lazy"})}
          {...imageSizes[img]}
        />
      ))}
    </div>
  );
}
