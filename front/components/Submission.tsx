import { Link } from "@nextui-org/link";
import { ImageSize, OCR, SubmissionMetadata, getImageUrl } from "../utils";
import Image from "next/image";
import { CopyToClipboard } from "./CopyToClipboard";

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
}: SubmissionMetadata & {
  isSingle: boolean;
  pageUrl: string;
  ocr: OCR;
  imageSizes: ImageSize;
}) {
  const uploadDate = new Date(uploaded_at);
  const idForSubmission = encodeURIComponent(submission_title);
  const submissionLink = `${pageUrl}#${idForSubmission}`;
  return (
    <div>
      <div className="flex gap-4 py-4 justify-between align-baseline">
        {!isSingle && (
          <CopyToClipboard text={submissionLink}>
            <h2
              id={idForSubmission}
              title="Click to copy link to this part"
              className="hover:text-sky-600 text-xl"
            >
              {submission_title}
            </h2>
          </CopyToClipboard>
        )}
        <div className="flex gap-4 align-baseline">
          <Link href={link} isExternal>
            Original Post
          </Link>
          <p>Upvotes: {upvotes}</p>
          <p>Uploaded at: {uploadDate.toDateString()}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center">
        {images.map((img) => (
          <Image
            loading="lazy"
            key={img}
            src={getImageUrl(img)}
            alt={ocr[img]}
            {...imageSizes[img]}
          />
        ))}
      </div>
    </div>
  );
}
