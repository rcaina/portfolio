import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import CommandPalette from "@/components/common/CommandPalette";
import Providers from "./providers";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteName = "Renzo Caiña";
const siteTitle = "Renzo Caiña, Full Stack Software Developer";
const siteDescription =
  "Renzo Caiña: full-stack software developer building products with Next.js, TypeScript, and Postgres. Currently at Belle. Previously at Renew Biotechnologies, Fiddle, and BYU.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://renzocaina.com"
  ),
  title: {
    default: siteTitle,
    template: "%s · Renzo Caiña",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: "https://renzocaina.com" }],
  creator: siteName,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-icon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f4ea" },
    { media: "(prefers-color-scheme: dark)", color: "#131210" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-foreground/30 focus:bg-background focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-foreground focus:shadow-md"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main
              id="main"
              className="mx-auto flex w-full max-w-5xl grow flex-col"
            >
              {children}
            </main>
            <CommandPalette />
          </div>
        </Providers>
      </body>
    </html>
  );
}
