import ProjectCard from "@/components/common/ProjectCard";
import { CODING_PROJECTS } from "@/lib/constants";
import SectionHeading from "@/components/common/SectionHeading";

const Projects = () => {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="flex w-full max-w-3xl scroll-mt-12 flex-col gap-6 px-4 md:scroll-mt-14"
    >
      <SectionHeading
        id="projects-title"
        label="projects"
        number="02"
        command="find"
        count={CODING_PROJECTS.length}
      />
      <div className="flex flex-col gap-2">
        {CODING_PROJECTS.map((project, index) => (
          <ProjectCard
            key={index}
            project={project}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
};

export default Projects;
