import ExperienceCard from "@/components/common/ExperienceCard";
import { EXPERIENCES } from "@/lib/contants";
import { useState } from "react";

const Experience = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAccordion = (toggle: boolean) => {
    setIsOpen(toggle === true ? true : false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        <div className="flex w-full items-center justify-center gap-4">
          <h2 className="text-4xl">EXPERIENCE</h2>
        </div>
      </div>
      <div className="flex flex-col gap-12">
        {EXPERIENCES.map((experience, index) => (
          <div key={index}>
            <ExperienceCard
              experience={experience}
              imagePosition={index % 2 ? "left" : "right"}
            />
            {experience.subsidiaries?.length > 0 && (
              <div className="mb-8 flex justify-center">
                <button
                  onClick={() => toggleAccordion(!isOpen)}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  {isOpen ? "Hide Subsidiaries" : "Show Subsidiaries"}
                </button>
              </div>
            )}
            {experience.subsidiaries?.length > 0 &&
              isOpen &&
              experience.subsidiaries.map((sub, index) => (
                <div key={index} className="pl-20 pr-20">
                  <ExperienceCard
                    key={index}
                    experience={sub}
                    imagePosition={index % 2 ? "left" : "right"}
                  />
                </div>
              ))}
            {index !== EXPERIENCES.length - 1 && (
              <hr className="w-full border-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
