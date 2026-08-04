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

  const props = {
    "False Memory": {
      color: "var(--fm)",
      pillText: "FM",
    },
    "Knights of Guinevere": { color: "var(--kog)", pillText: "KoG" },
  }[show];

  return (
    <td
      title={`This is a "${show}" comic`}
      className={className}
      style={{ backgroundColor: props.color }}
    >
      <Link href={`/show/${show}/`}>{props.pillText}</Link>
    </td>
  );
}
