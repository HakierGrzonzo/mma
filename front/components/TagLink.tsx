import { Tag, normalizeSlash } from "@/tags";
import Link from "next/link";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  tag: Tag;
}

export default function TagLink({ tag, children }: Props) {
  return (
    <Link href={`/tags/${encodeURIComponent(normalizeSlash(tag))}`}>
      {tag.name} {children}
    </Link>
  );
}
