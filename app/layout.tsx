import type { Metadata } from "next";
import { Instrument_Sans, Syne } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const display = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CleanMerit",
  description: "Community cleanup and repair rewards for Desa Mentari.",
  applicationName: "CleanMerit",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CleanMerit",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} bg-[var(--color-sand)]`}
    >
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,162,97,0.18),_transparent_28%),linear-gradient(180deg,_#f7f1e7_0%,_#efe6d7_100%)] font-sans text-[#123524] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
