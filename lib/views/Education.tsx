import Image from "next/image";
import byulogo from "@/public/images/byulogo.png";
import SectionHeading from "@/components/common/SectionHeading";
import { MAJOR, MINOR, UNIVERSITY } from "@/lib/constants";

const Education = () => {
  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className="flex w-full max-w-3xl scroll-mt-12 flex-col gap-6 px-4 md:scroll-mt-14"
    >
      <SectionHeading
        id="education-title"
        label="education"
        number="04"
        command="head -1"
      />
      <div className="grid w-full grid-cols-[3rem_1fr] items-start gap-3 rounded-md border border-foreground/10 bg-foreground/[0.015] px-4 py-4 sm:grid-cols-[4.5rem_2.75rem_1fr] sm:gap-5 sm:px-5">
        <div className="hidden flex-col items-start pt-0.5 sm:flex">
          <span className="font-mono text-2xl font-semibold leading-none tracking-tight text-foreground/85">
            2015
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            grad &apos;22
          </span>
        </div>

        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background">
          <Image
            src={byulogo}
            alt="BYU logo"
            width={48}
            height={48}
            className="h-full w-full bg-white object-contain"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="font-mono text-base font-semibold text-foreground sm:text-lg">
              {UNIVERSITY}
            </span>
            <span className="flex-shrink-0 font-mono text-xs text-muted-foreground sm:hidden">
              2015 · grad &apos;22
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-muted-foreground sm:text-sm">
            <span className="text-foreground/80">{MAJOR}</span>
            <span aria-hidden className="text-foreground/30">
              ·
            </span>
            <span>Provo, UT</span>
            <span aria-hidden className="text-foreground/30">
              ·
            </span>
            <span>Aug 2015 to Apr 2022</span>
          </div>
          <p className="mt-1 font-mono text-xs italic text-muted-foreground">
            {MINOR} (2015 to 2019)
          </p>
        </div>
      </div>
    </section>
  );
};

export default Education;
