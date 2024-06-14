import Image from "next/image";
import classes from "./RSSbutton.module.css";

export default function RSSbutton() {
  return (
    <a href="/feed.xml" className={classes.feed} rel="noreferrer" target="_blank">
      <Image alt="rss icon" className={classes.icon} src="/feed.png" width={14} height={14} /> Subscribe to RSS feed for
      notifications
    </a>
  );
}
