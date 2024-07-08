import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import UpdatedAtTimestamp from "@/components/UpdatedAtTimestamp";

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
  const now = new Date();
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e3606c" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#e3606c" />
      </head>
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
            <UpdatedAtTimestamp now={now} />
          </div>
        </footer>
      </body>
    </html>
  );
}
