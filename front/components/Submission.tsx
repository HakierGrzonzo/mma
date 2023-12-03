import { Link } from '@nextui-org/link'
import {OCR, SubmissionMetadata} from '../utils'

export function Submission({submission_title, isSingle, images, link, uploaded_at, upvotes, ocr}: SubmissionMetadata & {isSingle: boolean, ocr: OCR}) {
  const uploadDate = new Date(uploaded_at)
  return (
    <div>
      <div className="flex gap-4 md:py-10">
      {!isSingle &&<h2>{submission_title}</h2>}
      <Link href={link} isExternal>Original Post</Link>
      <p>Upvotes: {upvotes}</p>
      <p>Uploaded at: {uploadDate.toDateString()}</p>
      </div>
      <div className="flex flex-col gap-4 items-center">
      {images.map((img) => <img loading="lazy" key={img} src={`/images/${img.replace("./results/", "")}`} alt={ocr[img]}/>)}
      </div>
    </div>
  )
  }
