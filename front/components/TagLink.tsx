import { normalizeSlash } from "@/tags";
import Link from "next/link";
import { PropsWithChildren } from "react";
import classes from "./TagLink.module.css";

interface Props extends PropsWithChildren {
  tag: { name: string; description: string | null };
  prefetch?: boolean;
}

export default function TagLink({ tag, children, prefetch }: Props) {
  return (
    <Link
      className={classes.tagParent}
      prefetch={prefetch ?? false}
      href={`/tags/${encodeURIComponent(normalizeSlash(tag))}/`}
    >
      <div title={tag.description ?? undefined} className={classes.tag}>
        {tag.name} {children}
      </div>
    </Link>
  );
}
