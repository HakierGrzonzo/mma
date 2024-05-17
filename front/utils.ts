import { readFile, readdir } from "fs/promises";

export interface Comic {
  title: string;
  image_urls: string[];
  link: string;
  uploaded_at: string;
  upvotes: number;
}

export interface Image {
  ocr: string;
  height: number;
  width: number;
  file_path: string;
}

export interface Series {
  title: string;
  // AKA the name of the folder containing the series
  id: string
  comics: Comic[];
}

export interface Metadata {
  series: Series;
  images: Record<string, Image>
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

const ROOT_DIR = "./public/images";

export async function getAllMetadata() {
  const directories = await readdir(ROOT_DIR);
  const metadata = await Promise.all(directories.map(getSpecificMetadata));
  return metadata;
}

export async function getSpecificMetadata(dir: string) {
  const path = `${ROOT_DIR}/${dir}/metadata.json`;
  const file = await readJsonFile<Metadata>(path);
  return { ...file};
}

export function getImageUrl(image: Image) {
  return `/images/${image.file_path.replace("./results/", "")}`;
}

export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const formatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
