import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeSync — Real-Time Collaborative Code Editor",
  description:
    "Collaborative code editing with CRDT sync, live cursors, and instant HTML preview. Built with Next.js, Yjs, and Monaco Editor.",
  keywords: [
    "real-time",
    "CRDT",
    "collaborative-editor",
    "pair-programming",
    "yjs",
    "monaco",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
