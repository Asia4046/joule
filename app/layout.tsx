import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/Providers";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mergeCustomization } from "@/lib/customization";
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // accent lives on the root theme, which renders above the protected layout
  const user = await getSessionUser();
  const prefs = user
    ? await prisma.userPreference.findUnique({ where: { userId: user.id }, select: { customization: true } })
    : null;
  const { accent } = mergeCustomization(prefs?.customization);

  return (
    <html
      lang="en"
      data-jee-theme="dark"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <Providers accent={accent}>{children}</Providers>
      </body>
    </html>
  );
}
