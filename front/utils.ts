import { readFile, readdir } from "fs/promises";

export interface SubmissionMetadata {
  submission_title: string,
  images: string[],
  link: string,
  uploaded_at: string
}

export interface SeriesMetadata {
  name: string,
  submissions: SubmissionMetadata[],
  latest_episode: string,
  upvotes_total: number
}

async function readJsonFile<T>(path: string): Promise<T> {
  try {
    const fileContent = await readFile(path, 'utf8')
    return JSON.parse(fileContent)
  } catch (e){
    console.error(e, path)
    throw e
  }
}

export async function getAllMetadata() {
  const ROOT_DIR = '../results'
  const directories = await readdir(ROOT_DIR)
  const metadata = await Promise.all(directories.map(dir => readJsonFile<SeriesMetadata>(`${ROOT_DIR}/${dir}/metadata.json`)))
  return metadata
  
}
