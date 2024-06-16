/* eslint-disable @next/next/no-img-element */
import { Comic, getImageUrl, Metadata } from "@/utils";

export function RSSdescription({
  comic,
  metadata,
}: {
  comic: Comic;
  metadata: Metadata;
}) {
  return (
    <>
      {comic.image_urls.map((image_url) => {
        const image = metadata.images[image_url];
        return (
          <img
            key={image_url}
            src={getImageUrl(image)}
            alt={image.ocr}
            width={image.width}
            height={image.height}
          />
        );
      })}
      <p>
        <a href={comic.link}>Original Post</a>
      </p>
    </>
  );
}
