import { PropsWithChildren } from "react";
import classes from "./CoverImage.module.css";

const date = new Date();
const shouldUseKog = date.getDate() % 3 === 0;

export default function CoverImage({ children }: PropsWithChildren) {
  const image = {
    toh: "cover.webp",
    kog: "cover-kog.webp",
  };

  const imageLink = image[shouldUseKog ? "kog" : "toh"];

  return (
    <div
      className={classes.coverImage}
      style={{ backgroundImage: `url(/assets/${imageLink})` }}
    >
      <h1 className="">MoringMark archive</h1>
      {children}
    </div>
  );
}
