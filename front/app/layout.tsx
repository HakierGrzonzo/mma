import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { Link } from "@nextui-org/link";
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
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
					<div className="relative flex flex-col h-screen">
						<main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
							{children}
						</main>
						<footer className="w-full flex flex-col gap-1 items-center justify-center py-3 px-6">
              <div>
                Page created and hosted by u/hakiergrzonzo, just because he likes those comics
                and wanted to make sure he did not miss any part of <em>Grom Factor</em>.
              </div>
              <div className="flex gap-4 items-center justify-center"> 
                <Link href="https://github.com/HakierGrzonzo/mma">Source Code</Link>
                <p>Updated at {formatter.format(new Date())}</p>
              </div>
						</footer>
					</div>
				</Providers>
			</body>
		</html>
	);
}
