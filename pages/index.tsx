import Container from "@/components/layout/Container";
import Education from "@/lib/views/Education";
import Experience from "@/lib/views/Experience";
import Hero from "@/lib/views/Hero";
import Head from "next/head";
import { StaticImageData } from "next/image";

export type SocialLink = {
  name: string;
  link: string;
  img: StaticImageData;
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Portfolio</title>
        <meta
          name="description"
          content="Personal portfolio built using Next.js and deployed with Vercel."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <main className="flex flex-col items-center gap-14 rounded-md text-center">
          <Hero />
          <hr className="w-full border-secondary-500" />
          <Experience />
          <hr className="w-full border-secondary-500" />
          <Education />
        </main>
      </Container>
    </>
  );
}
