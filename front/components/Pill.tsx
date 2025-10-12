import { MetaTableRow } from "@/types/db";
import Link from "next/link";
interface Props {
  className?: string;
  show: MetaTableRow["show"];
}

export function SeriesPill({ className, show }: Props) {
  if (show === "The Owl House") {
    return <td />;
  }

  return (
    <td
      title={`This is a "${show}" comic`}
      className={className}
      style={{ backgroundColor: "var(--kog)" }}
    >
      <Link href={`/show/${show}/`}>KoG</Link>
    </td>
  );
}
