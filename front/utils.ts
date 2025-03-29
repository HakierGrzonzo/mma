import { bucket_name } from "./constants";

const devProtocol = process.env.NODE_ENV === "production" ? "https" : "http";
const IMAGE_HOST =
  process.env.IMAGE_HOST ??
  `${devProtocol}://${bucket_name}.s3-website-us-east-1.amazonaws.com`;

export function getImageUrl(image: { file_path: string }) {
  let imagePath = image.file_path.replace("./results/", "");
  imagePath = encodeURIComponent(imagePath);
  if (bucket_name === undefined) {
    return `/images/${imagePath}`;
  }
  return `${IMAGE_HOST}/${imagePath}`;
}

export const formatter = new Intl.DateTimeFormat("en-UK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function getSubmissionLinks(pageUrl: string, title: string) {
  const idForComic = encodeURIComponent(title);
  return {
    idForComic,
    comicLink: `${pageUrl}#${idForComic}`,
  };
}
