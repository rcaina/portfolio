import Education from "@/lib/views/Education";
import Experience from "@/lib/views/Experience";
import Hero from "@/lib/views/Hero";
import OtherProjects from "@/lib/views/OtherProjects";
import Projects from "@/lib/views/Projects";

export default function Home() {
  return (
    <div className="m-auto flex flex-col items-center gap-14 text-center">
      <Hero />
      <Experience />
      <Projects />
      <OtherProjects />
      <Education />
    </div>
  );
}
