import "react-toastify/dist/ReactToastify.min.css";
import "@/styles/globals.css";

import { Slide, ToastContainer as Toaster } from "react-toastify";

import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "@/components/Provider/ThemeProvider";

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps<Record<string, never>>) {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/favicon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/favicon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/icons/apple-icon.png"></link>
      </Head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider delayDuration={400}>
          <Layout>
            <Component {...pageProps} />
            <Toaster position="bottom-right" transition={Slide} />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </>
  );
}
