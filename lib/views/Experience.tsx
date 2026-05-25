import ExperienceCard from "@/components/common/ExperienceCard";
import SectionHeading from "@/components/common/SectionHeading";
import { EXPERIENCES } from "@/lib/constants";

const Experience = () => {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="flex w-full max-w-3xl scroll-mt-12 flex-col gap-6 px-4 md:scroll-mt-14"
    >
      <SectionHeading
        id="experience-title"
        label="experience"
        number="01"
        command="cat"
        count={EXPERIENCES.length}
      />
      <div className="flex flex-col gap-2">
        {EXPERIENCES.map((experience, index) => (
          <ExperienceCard
            key={index}
            experience={experience}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
};

export default Experience;
