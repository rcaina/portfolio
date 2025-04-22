import "react-toastify/dist/ReactToastify.min.css";
import "@/styles/globals.css";

import { Slide, ToastContainer as Toaster } from "react-toastify";

import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "@/components/Provider/ThemeProvider";

// import "@/styles/richTextEditorGlobalStyles.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
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
        <SessionProvider
          session={session}
          refetchInterval={10 * 60} // Re-fetch every 10 minutes
          refetchOnWindowFocus={true}
          refetchWhenOffline={false}
        >
          <TooltipProvider delayDuration={400}>
            <Layout>
              <Component {...pageProps} />
              <Toaster position="bottom-right" transition={Slide} />
            </Layout>
          </TooltipProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
