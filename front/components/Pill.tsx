import { MetaTableRow } from "@/types/db";
interface Props {
  className?: string;
  show: MetaTableRow["show"];
}

export function SeriesPill({ className, show }: Props) {
  const pillProps: Record<MetaTableRow["show"], [string, string] | null> = {
    "The Owl House": null,
    "Knights of Guinevere": ["KoG", "var(--kod)"],
  };
  const pill = pillProps[show];

  if (pill === null) {
    return <td />;
  }

  const [pillText, pillColor] = pill || ["", ""];

  return (
    <td
      title={`This is a "${show}" comic`}
      className={className}
      style={{ backgroundColor: pillColor }}
    >
      {pillText}
    </td>
  );
}
