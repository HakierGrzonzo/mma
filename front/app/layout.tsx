import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { formatter } from "@/utils";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <main>{children}</main>
        <footer>
          <div>
            Page created and hosted by u/hakiergrzonzo, just because he likes
            those comics and wanted to make sure he did not miss any part of{" "}
            <em>Grom Factor</em>.
          </div>
          <div className="flex">
            <Link href="https://github.com/HakierGrzonzo/mma">Source Code</Link>
            <p>Updated at {formatter.format(new Date())}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
