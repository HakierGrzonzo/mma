import Link from "next/link";
import classes from "./Header.module.css";
import { RandomComicButton } from "./RandomComicButton";
import { Metadata } from "@/types";

interface Props {
  currentComic?: Metadata;
}

export default function Header({ currentComic }: Props) {
  return (
    <div className={classes.stickyHeader}>
      <Link href="/">Home</Link>
      <Link href="/tags">Tags</Link>
      <RandomComicButton currentComic={currentComic} />
    </div>
  );
}
