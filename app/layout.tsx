import type { Metadata } from "next";
import { Lexend, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

const display = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapFix",
  description: "Community cleanup and repair rewards for Desa Mentari.",
  applicationName: "SnapFix",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SnapFix",
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
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} bg-[var(--color-shell)]`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--color-shell)] font-sans text-[var(--color-copy)] antialiased"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
