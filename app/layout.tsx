import "react-toastify/dist/ReactToastify.min.css";
import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ChatWidget from "@/components/common/ChatWidget";
import Container from "@/components/layout/Container";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteDescription =
  "Personal portfolio built using Next.js and deployed with Vercel.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://renzocaina.com"
  ),
  title: "Portfolio",
  description: siteDescription,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-icon.png",
  },
  openGraph: {
    title: "Portfolio",
    description: siteDescription,
    type: "website",
    images: ["/icons/apple-icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio",
    description: siteDescription,
    images: ["/icons/apple-icon.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex grow flex-col">
              <Container>{children}</Container>
            </main>
            <SideNav />
            <ThemeToggle />
            <ChatWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}
