import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import QuickLink from "./QuickLink";
import { FC } from "react";

interface Project {
  title: string;
  image: StaticImageData;
  github_links?: string[];
  description: string;
  technologies: string[];
  link?: string;
  color?: string;
  demo_account_info?: {
    email: string;
    password: string;
  };
}

const ProjectCard: FC<{
  project: Project;
  imagePosition?: "left" | "right";
}> = ({ project, imagePosition = "left" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div
        className={`flex w-full flex-col items-center gap-8 space-y-8 md:flex-row ${
          imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        <div className="w-full md:w-1/2">
          <div
            className={`relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-lg`}
          >
            <Image
              src={project.image || ""}
              alt={`${project.title} project image`}
              priority
              width={200}
              height={200}
              className="rounded-xl border"
              style={
                project.color
                  ? { borderColor: project.color, color: project.color }
                  : {}
              }
            />
          </div>
        </div>

        <div className="w-full space-y-4 text-left md:w-1/2">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {project.title}
          </h3>

          <div className="flex gap-4">
            {project.github_links && project.github_links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.github_links.map((link, index) => (
                  <QuickLink
                    key={index}
                    data={{
                      href: link,
                      label: `GitHub${
                        project.github_links && project.github_links.length > 1
                          ? ` ${index + 1}`
                          : ""
                      }`,
                      showIcon: true,
                    }}
                  />
                ))}
              </div>
            )}

            {project.link && !project.title.includes("Portfolio") && (
              <QuickLink
                data={{
                  href: project.link,
                  label: project.technologies.includes("Webflow")
                    ? "View Website"
                    : "Try Demo",
                  showIcon: true,
                }}
              />
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {project.demo_account_info && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                Demo Account
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {project.demo_account_info.email}
                </p>
                <p>
                  <span className="font-medium">Password:</span>{" "}
                  {project.demo_account_info.password}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
