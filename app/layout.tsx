import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";

import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Small Town Theater",
  description:
    "Jackson Theater and Sherburn Theater — two screens, one community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${newsreader.variable} ${workSans.variable}`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
