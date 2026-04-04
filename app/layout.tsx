import type { Metadata } from "next";
import { Newsreader, Work_Sans } from "next/font/google";

import { AppToaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/config";

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
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} brings together local screens, shared programming, and community moviegoing.`,
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
      <body className="flex min-h-full flex-col">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
