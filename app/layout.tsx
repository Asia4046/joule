import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Joule — JEE Preparation Platform",
    template: "%s · Joule",
  },
  description:
    "The personal JEE prep dossier: syllabus tracking, mock-test analytics, revision scheduling and insights. Work, measured.",
  applicationName: "Joule",
  openGraph: {
    title: "Joule — JEE Preparation Platform",
    description:
      "Concept labs with real simulations, mock-test forensics, a mistake ledger that never forgets, and a revision engine that schedules itself. Work, measured.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7EF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0908" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-jee-theme="dark"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
