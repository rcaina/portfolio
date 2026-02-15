import ExperienceCard from "@/components/common/ExperienceCard";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { EXPERIENCES } from "@/lib/contants";
import { useState } from "react";

const Experience = () => {
  const [openAccordions, setOpenAccordions] = useState<Set<number>>(
    new Set([0])
  );

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl">
        <div className="flex w-full items-center justify-center gap-4">
          <hr className="w-full border-secondary-500" />
          <h2 className="text-4xl">EXPERIENCE</h2>
          <hr className="w-full border-secondary-500" />
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
              <div className="mb-4 mt-4 overflow-hidden rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-center gap-2 px-6 py-4 text-left font-medium transition-colors hover:bg-gray-100 hover:text-secondary-600"
                  aria-expanded={openAccordions.has(index)}
                >
                  {openAccordions.has(index) ? (
                    <>
                      <ChevronUpIcon className="h-5 w-5 shrink-0" />
                      Hide Subsidiaries ({experience.subsidiaries?.length})
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-5 w-5 shrink-0" />
                      Show Subsidiaries ({experience.subsidiaries?.length})
                    </>
                  )}
                </button>
                {openAccordions.has(index) && (
                  <div className="border-t border-gray-200 px-4 pb-4 pt-2">
                    {experience.subsidiaries?.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="mb-4 rounded-lg bg-white py-4 pl-5 pr-5 last:mb-0"
                      >
                        <ExperienceCard
                          experience={sub}
                          imagePosition={subIndex % 2 ? "left" : "right"}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
