import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/lny5tsf.css" />
        <meta property="og:title" content="Portfolio" />
        <meta
          property="og:description"
          content="Personal portfolio built using Next.js and deployed with Vercel."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icons/apple-icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portfolio" />
        <meta
          name="twitter:description"
          content="Personal portfolio built using Next.js and deployed with Vercel."
        />
        <meta name="twitter:image" content="/icons/apple-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
