import SocialCard from "@/components/common/SocialCard";
import Container from "@/components/layout/Container";
import Hero from "@/lib/views/Hero";
import Head from "next/head";
import githublogo from "@/public/images/githublogo.png";
import linkedInLogo from "@/public/images/linkedInLogo.png";
import facebooklogo from "@/public/images/facebooklogo.png";
import instalogo from "@/public/images/instalogo.jpg";
import { StaticImageData } from "next/image";

export type SocialLink = {
  name: string;
  link: string;
  img: StaticImageData;
};

const socialLinks: SocialLink[] = [
  {
    name: "Github",
    link: "https://github.com/rcaina",
    img: githublogo,
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/renzocaina/",
    img: linkedInLogo,
  },
];

const otherSocialLinks: SocialLink[] = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/renzo.caina/",
    img: facebooklogo,
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/rcaina18/?locale=it&hl=en",
    img: instalogo,
  },
];

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
        <main className="flex w-full flex-col justify-center gap-14 rounded-md">
          <Hero />
          <hr className="w-full border-foreground" />
          <div className="flex items-center justify-center gap-4">
            <h2 className="items-center justify-center text-xl font-medium">
              Email:
            </h2>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.location.href =
                  "mailto:" + "renzo.caina" + "@" + "outlook.com";
              }}
              className="group inline-flex items-center justify-center text-lg text-secondary-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
            >
              renzo.caina@outlook.com
            </a>
          </div>
          <hr className="w-full border-foreground" />
          <div className="flex flex-col gap-8 text-center">
            <h2 className="text-xl font-medium">Professional Links</h2>
            <div className="grid grid-cols-2 gap-8">
              {socialLinks.map((link, index) => (
                <div key={index} className="grid-cols-1">
                  <SocialCard socialLink={link} />
                </div>
              ))}
            </div>
          </div>
          <hr className="w-full border-foreground" />
          <div className="flex flex-col gap-8 text-center">
            <h2 className="text-xl font-medium">Social Links</h2>
            <div className="grid grid-cols-2 gap-8">
              {otherSocialLinks.map((link, index) => (
                <div key={index} className="grid-cols-1">
                  <SocialCard socialLink={link} />
                </div>
              ))}
            </div>
          </div>
        </main>
      </Container>
    </>
  );
}
