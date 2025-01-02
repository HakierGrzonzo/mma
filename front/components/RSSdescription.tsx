/* eslint-disable @next/next/no-img-element */
import { db, Image } from "@/db";
import { getImageUrl } from "@/utils";

export function RSSdescription({
  comic,
}: {
  comic: { id: string; link: string };
}) {
  const images = db
    .prepare(
      `
    SELECT *
    FROM
      image
    WHERE
      image.comic = ?
    ORDER BY
      image."order"
    `,
    )
    .all(comic.id) as Image[];
  return (
    <>
      {images.map((image) => {
        return (
          <img
            key={image.link}
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
