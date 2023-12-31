import { readFile, readdir } from "fs/promises";

export interface SubmissionMetadata {
  submission_title: string;
  images: string[];
  link: string;
  uploaded_at: string;
  upvotes: number;
}

export interface SeriesMetadata {
  name: string;
  submissions: SubmissionMetadata[];
  latest_episode: string;
  upvotes_total: number;
  directory_name: string;
}

async function readJsonFile<T>(path: string): Promise<T> {
  try {
    const fileContent = await readFile(path, "utf8");
    return JSON.parse(fileContent);
  } catch (e) {
    console.error(e, path);
    throw e;
  }
}

const ROOT_DIR = "../results";

export async function getAllMetadata() {
  const directories = await readdir(ROOT_DIR);
  const metadata = await Promise.all(directories.map(getSpecificMetadata));
  return metadata;
}

export async function getSpecificMetadata(dir: string) {
  const path = `${ROOT_DIR}/${dir}/metadata.json`;
  const file = await readJsonFile<SeriesMetadata>(path);
  return { ...file, directory_name: dir };
}

export type OCR = Record<string, string>;
export type ImageSize = Record<
  string,
  {
    width: number;
    height: number;
  }
>;

export async function getOcr(dir: string) {
  const path = `${ROOT_DIR}/${dir}/ocr.json`;
  const file = await readJsonFile<OCR>(path);
  return file;
}

export async function getImageSizes(dir: string) {
  const path = `${ROOT_DIR}/${dir}/images.json`;
  const file = await readJsonFile<ImageSize>(path);
  return file;
}

export function getImageUrl(img: string) {
  return `/images/${img.replace("./results/", "")}`;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const formatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
