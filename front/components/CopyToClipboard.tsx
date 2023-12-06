"use client";
import { PropsWithChildren } from "react";

export function CopyToClipboard({
  children,
  text,
}: PropsWithChildren & { text: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <a style={{ cursor: "pointer", color: "var(--foreground)" }} onClick={copy}>
      {children}
    </a>
  );
}
