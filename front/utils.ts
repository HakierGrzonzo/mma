import { readFile } from "fs/promises";
import { bucket_name } from "./constants";
import { Metadata, Image, Comic } from "./types";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSeriesTitle } from "./clientUtils";
import { unstable_cache } from "next/cache";

const s3Client = new S3Client({});

async function readJsonFileLocal<T>(path: string): Promise<T> {
  try {
    const fullPath = `${ROOT_DIR}/${path}`;
    const fileContent = await readFile(fullPath, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(e, path);
    throw e;
  }
}

async function getFileFromAws(path: string) {
  const command = new GetObjectCommand({ Bucket: bucket_name, Key: path });
  const response = await s3Client.send(command);
  const body = response.Body;
  if (body === undefined) {
    throw new Error("Invalid response.Body");
  }
  const content = await body.transformToString();
  return JSON.parse(content);
}

async function readJsonFileS3<T>(path: string): Promise<T> {
  try {
    const getFile = unstable_cache(() => getFileFromAws(path), [path], {
      tags: [path],
      revalidate: 60,
    });
    return await getFile();
  } catch (e) {
    console.error(e, path);
    throw e;
  }
}

export const readJsonFile =
  bucket_name === undefined ? readJsonFileLocal : readJsonFileS3;

const ROOT_DIR = "./public/images";

export async function getAllMetadata() {
  const metadata = await readJsonFile<Record<string, Metadata>>("index.json");
  return Object.values(metadata);
}

export async function getSpecificMetadata(dir: string) {
  const path = `${dir}/metadata.json`;
  const file = await readJsonFile<Metadata>(path);
  return file;
}

const devProtocol = process.env.NODE_ENV === "production" ? "https" : "http";
const IMAGE_HOST =
  process.env.IMAGE_HOST ??
  `${devProtocol}://${bucket_name}.s3-website-us-east-1.amazonaws.com`;

export function getImageUrl(image: Image) {
  const imagePath = image.file_path.replace("./results/", "");
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

export function getSubmissionLinks(pageUrl: string, title: Comic["title"]) {
  const idForComic = encodeURIComponent(title);
  return {
    idForComic,
    comicLink: `${pageUrl}#${idForComic}`,
  };
}

export function getComicDescrtiptionFromAltText(meta: Metadata) {
  const firstComic = meta.series.comics.at(-1);
  const fallbackDescription = `${getSeriesTitle(meta.series)} - Comic by MoringMark`;

  if (firstComic === undefined) {
    return fallbackDescription;
  }

  const firstImage = meta.images[firstComic.image_urls[0]];
  const imageAltText = firstImage.ocr;
  if (imageAltText.length < fallbackDescription.length) {
    return fallbackDescription;
  }
  return `${imageAltText} - Comic by MoringMark`;
}
