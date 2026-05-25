import Education from "@/lib/views/Education";
import Experience from "@/lib/views/Experience";
import Hero from "@/lib/views/Hero";
import OtherProjects from "@/lib/views/OtherProjects";
import Projects from "@/lib/views/Projects";
import GithubStrip from "@/components/common/GithubStrip";
import SectionReveal from "@/components/common/SectionReveal";
import DotGridBackground from "@/components/motion/DotGridBackground";
import EditorGutter from "@/components/motion/EditorGutter";

export default function Home() {
  return (
    <>
      <DotGridBackground />
      <EditorGutter />
      <div className="relative z-10 mx-auto flex w-full flex-col pb-32">
        <SectionReveal>
          <Hero />
        </SectionReveal>
        <SectionReveal className="mt-[clamp(2.5rem,6vw,4rem)]">
          <GithubStrip />
        </SectionReveal>
        <SectionReveal className="mt-[clamp(5rem,10vw,8rem)]">
          <Experience />
        </SectionReveal>
        <SectionReveal className="mt-[clamp(4rem,8vw,6rem)]">
          <Projects />
        </SectionReveal>
        <SectionReveal className="mt-[clamp(4rem,8vw,6rem)]">
          <OtherProjects />
        </SectionReveal>
        <SectionReveal className="mt-[clamp(4rem,8vw,6rem)]">
          <Education />
        </SectionReveal>
      </div>
    </>
  );
}
