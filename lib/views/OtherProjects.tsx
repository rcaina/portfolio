import ProjectCard from "@/components/common/ProjectCard";
import SectionHeading from "@/components/common/SectionHeading";
import { WEBFLOW_PROJECTS } from "@/lib/constants";

const OtherProjects = () => {
  return (
    <section
      id="other-projects"
      aria-labelledby="other-projects-title"
      className="flex w-full max-w-3xl scroll-mt-12 flex-col gap-6 px-4 md:scroll-mt-14"
    >
      <SectionHeading
        id="other-projects-title"
        label="webflow"
        number="03"
        command="ls"
        count={WEBFLOW_PROJECTS.length}
      />
      <div className="flex flex-col gap-2">
        {WEBFLOW_PROJECTS.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
};

export default OtherProjects;
