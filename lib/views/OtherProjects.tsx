import ProjectCard from "@/components/common/ProjectCard";
import { WEBFLOW_PROJECTS } from "@/lib/contants";

const OtherProjects = () => {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        <div className="flex w-full items-center justify-center gap-4">
          <hr className="w-full border-secondary-500" />
          <div className="whitespace-nowrap">
            <h2 className="text-4xl">WEBFLOW PROJECTS</h2>
          </div>
          <hr className="w-full border-secondary-500" />
        </div>
      </div>
      <div className="flex flex-col gap-12">
        {WEBFLOW_PROJECTS.map((project, index) => (
          <div key={index}>
            <ProjectCard
              project={project}
              imagePosition={index % 2 ? "left" : "right"}
            />
            {index !== WEBFLOW_PROJECTS.length - 1 && (
              <hr className="w-full border-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherProjects;
