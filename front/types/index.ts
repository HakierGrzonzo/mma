import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
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
  id: string;
  comics: Comic[];
}

export interface Metadata {
  series: Series;
  images: Record<string, Image>;
  tags: number[];
}
