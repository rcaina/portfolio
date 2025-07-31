import ProjectCard from "@/components/common/ProjectCard";
import { CODING_PROJECTS } from "@/lib/contants";

const Projects = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        <div className="flex w-full items-center justify-center gap-4">
          <hr className="w-full border-secondary-500" />
          <h2 className="text-4xl">PROJECTS</h2>
          <hr className="w-full border-secondary-500" />
        </div>
      </div>
      <div className="flex flex-col gap-12">
        {CODING_PROJECTS.map((project, index) => (
          <div key={index}>
            <ProjectCard
              project={project}
              imagePosition={index % 2 ? "left" : "right"}
            />
            {index !== CODING_PROJECTS.length - 1 && (
              <hr className="w-full border-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
