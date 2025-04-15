import Link from "next/link";
import classes from "./Header.module.css";
import { RandomComicButton } from "./RandomComicButton";

interface Props {
  currentComicSeries?: { id: string };
}

export default function Header({ currentComicSeries }: Props) {
  return (
    <div className={classes.stickyHeader}>
      <Link href="/">Home</Link>
      <Link href="/tags">Tags</Link>
      <Link href="/search">Search</Link>
      <RandomComicButton currentComic={currentComicSeries} />
    </div>
  );
}
