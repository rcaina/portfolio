import Head from "next/head";
import Container from "@/components/layout/Container";
import ExperienceCard from "@/components/common/ExperienceCard";
import { EXPERIENCES } from "@/lib/contants";
import { useState } from "react";

const Experience = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleAccordion = (toggle: boolean) => {
    setIsOpen(toggle === true ? true : false);
  };

  return (
    <>
      <Head>
        <title>Experience | Portfolio</title>
        <meta name="description" content="View my experience and work" />
      </Head>
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl">
            <div className="m-14 flex w-full items-center gap-4">
              <hr className="w-full border-secondary-500" />
              <h2 className="text-4xl">EXPERIENCE</h2>
              <hr className="w-full border-secondary-500" />
            </div>
          </div>
          <div className="text-center">
            <a
              href={`https://rcaina.github.io/files/resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-foreground p-4 hover:text-secondary-500 hover:shadow-lg hover:shadow-secondary-500"
            >
              Download Resume
            </a>
          </div>
          <hr className="w-full border-foreground" />
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
      </Container>
    </>
  );
};

export default Experience;
