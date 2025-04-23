import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import QuickLink from "./QuickLink";

interface Experience {
  title: string;
  company: string;
  date: string;
  image: StaticImageData;
  landingPage: string;
  portal: string;
  description: string[];
  technologies?: string[];
  color?: string;
}

const ExperienceCard: React.FC<{
  experience: Experience;
  imagePosition?: "left" | "right";
}> = ({ experience, imagePosition = "left" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16 w-full"
    >
      <div
        className={`flex w-full flex-col items-center gap-8 md:flex-row ${
          imagePosition === "left" ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        <div className="w-full md:w-1/2">
          <div
            className={`relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-lg`}
          >
            <Image
              src={experience.image}
              alt={`${experience.company} image`}
              priority
              width={200}
              height={200}
              className={`rounded-xl border`}
              style={experience.color ? { borderColor: experience.color } : {}}
            />
          </div>
        </div>

        <div className="w-full space-y-4 text-left md:w-1/2">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            {experience.title}
          </h3>
          <QuickLink
            data={{
              href: `${experience.landingPage}`,
              label: `${experience.company}`,
            }}
          />
          <p className="text-gray-500 dark:text-gray-400">{experience.date}</p>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            {experience.description.map((bulletPoint) => (
              <li key={bulletPoint}>{bulletPoint}</li>
            ))}
          </ul>
          {experience.technologies && (
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          {experience?.portal && (
            <QuickLink
              data={{
                href: `${experience.portal}`,
                label: "Go to testing portal",
                showIcon: true,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
