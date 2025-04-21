import Head from "next/head";
import React from "react";

export default function Error404Page() {
  <Head>
    <title>404 Page Not Found - Portfolio</title>
    <meta name="robots" content="noindex,nofollow" />
  </Head>;
  return (
    <div className="flex h-full w-full grow items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-900">
        404 - Page Not Found
      </h2>
    </div>
  );
}
