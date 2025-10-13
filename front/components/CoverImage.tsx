import { PropsWithChildren } from "react";
import classes from "./CoverImage.module.css";

export default function CoverImage({ children }: PropsWithChildren) {
  return (
    <div className={classes.coverImage}>
      <h1 className="">MoringMark archive</h1>
      {children}
    </div>
  );
}
