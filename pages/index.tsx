import Container from "@/components/layout/Container";
import Education from "@/lib/views/Education";
import Experience from "@/lib/views/Experience";
import Hero from "@/lib/views/Hero";
import OtherProjects from "@/lib/views/OtherProjects";
import Projects from "@/lib/views/Projects";
import Head from "next/head";
import { StaticImageData } from "next/image";

export type SocialLink = {
  name: string;
  link: string;
  img: StaticImageData;
  color?: string;
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
        <main className="m-auto flex flex-col items-center gap-14 text-center">
          <Hero />
          <Experience />
          <Projects />
          <OtherProjects />
          <Education />
        </main>
      </Container>
    </>
  );
}
