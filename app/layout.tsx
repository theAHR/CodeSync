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
  title: "CodeSync — Collaborative Code Editor",
  description:
    "Pair program in the browser with live cursors, chat, voice, and instant HTML preview. No accounts, no setup — just share a room link.",
  keywords: [
    "real-time",
    "CRDT",
    "collaborative-editor",
    "pair-programming",
    "yjs",
    "monaco",
  ],
  icons: {
    icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.png` }],
    apple: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.png` }],
  },
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
