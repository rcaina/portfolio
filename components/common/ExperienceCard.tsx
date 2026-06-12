"use client";

import Image, { type StaticImageData } from "next/image";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { IntegrationChip, LinkChip, TechChip } from "./Chip";

interface Experience {
  title: string;
  company: string;
  date: string;
  location?: string;
  image: StaticImageData;
  landingPage: string;
  portal: string;
  description: string[];
  technologies?: string[];
  integrations?: string[];
  color?: string;
  backgroundColor?: string;
  subsidiaries?: Experience[];
}

interface Props {
  experience: Experience;
  defaultOpen?: boolean;
  nested?: boolean;
}

function extractYear(date: string): string {
  const match = date.match(/(20\d{2})/);
  return match ? match[1] : "";
}

const ExperienceCard: React.FC<Props> = ({
  experience,
  defaultOpen = false,
  nested = false,
}) => {
  const hasDescription = experience.description.length > 0;
  const hasTech = (experience.technologies?.length ?? 0) > 0;
  const hasIntegrations = (experience.integrations?.length ?? 0) > 0;
  const hasSubs = (experience.subsidiaries?.length ?? 0) > 0;
  const canExpand = hasDescription || hasTech || hasIntegrations || hasSubs;
  const [open, setOpen] = useState(defaultOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const year = extractYear(experience.date);
  const isCurrent = /present/i.test(experience.date);
  const slug = experience.company.replace(/\s+/g, "-");

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [open]);

  const showYearColumn = !nested && year !== "";
  const gridClass = showYearColumn
    ? "grid w-full grid-cols-[3rem_1fr_auto] items-start gap-3 px-4 py-4 text-left sm:grid-cols-[4.5rem_2.75rem_1fr_auto] sm:gap-5 sm:px-5"
    : "grid w-full grid-cols-[3rem_1fr_auto] items-start gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5";

  const head = (
    <div className={gridClass}>
      {showYearColumn && (
        <div className="hidden flex-col items-start pt-0.5 sm:flex">
          <span
            className={`font-mono text-2xl font-semibold leading-none tracking-tight ${
              isCurrent ? "text-brand" : "text-foreground/85"
            }`}
          >
            {year}
          </span>
          {isCurrent && (
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brand/80">
              now
            </span>
          )}
        </div>
      )}

      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background sm:h-11 sm:w-11">
        <Image
          src={experience.image}
          alt={experience.company}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="truncate font-mono text-base font-semibold text-foreground sm:text-lg">
            {experience.company}
          </span>
          {year && (
            <span className="flex-shrink-0 font-mono text-xs text-muted-foreground sm:hidden">
              {year}
              {isCurrent ? " · now" : ""}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-muted-foreground sm:text-sm">
          <span className="text-foreground/80">{experience.title}</span>
          {experience.location && (
            <>
              <span aria-hidden className="text-foreground/30">
                ·
              </span>
              <span>{experience.location}</span>
            </>
          )}
          <span aria-hidden className="text-foreground/30">
            ·
          </span>
          <span className="text-muted-foreground">{experience.date}</span>
        </div>
        {!open && hasTech && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {experience.technologies!.slice(0, 5).map((t) => (
              <TechChip key={t}>{t}</TechChip>
            ))}
            {experience.technologies!.length > 5 && (
              <span className="font-mono text-[10px] text-muted-foreground">
                +{experience.technologies!.length - 5} more
              </span>
            )}
          </div>
        )}
        {!canExpand && !hasTech && (
          <span className="mt-1 font-mono text-xs italic text-muted-foreground">
            Details coming soon.
          </span>
        )}
      </div>

      {canExpand ? (
        <span
          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-foreground/15 text-muted-foreground transition-all duration-300 ease-out group-hover:border-foreground/30 group-hover:text-foreground ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="h-7 w-7 flex-shrink-0" aria-hidden />
      )}
    </div>
  );

  const body = (
    <>
      {hasDescription && (
        <ul className="space-y-2 font-mono text-xs text-foreground/85 sm:text-sm">
          {experience.description.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="select-none text-brand">
                ›
              </span>
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      )}

      {hasTech && (
        <div className="mt-4">
          {hasIntegrations && (
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              stack
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {experience.technologies!.map((t) => (
              <TechChip key={t}>{t}</TechChip>
            ))}
          </div>
        </div>
      )}

      {hasIntegrations && (
        <div className="mt-4">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            integrations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {experience.integrations!.map((t) => (
              <IntegrationChip key={t}>{t}</IntegrationChip>
            ))}
          </div>
        </div>
      )}

      {(experience.landingPage || experience.portal) && (
        <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
          {experience.landingPage && (
            <LinkChip href={experience.landingPage}>visit site</LinkChip>
          )}
          {experience.portal && (
            <LinkChip href={experience.portal}>portal</LinkChip>
          )}
        </div>
      )}

      {hasSubs && (
        <div className="mt-5 space-y-2">
          <p className="font-mono text-xs text-muted-foreground">
            <span aria-hidden className="text-brand/70">
              └─
            </span>{" "}
            subsidiaries
          </p>
          {experience.subsidiaries!.map((sub, i) => (
            <ExperienceCard key={i} experience={sub} nested />
          ))}
        </div>
      )}
    </>
  );

  const wrapperClass = `group rounded-md border transition-colors ${
    nested
      ? "border-foreground/8 bg-foreground/[0.025]"
      : "border-foreground/10 bg-foreground/[0.015]"
  } ${canExpand ? "hover:border-foreground/25" : ""}`;

  const bodyPaddingClass = "border-t border-foreground/10 px-4 py-4 sm:px-5";

  if (!canExpand) {
    return <div className={wrapperClass}>{head}</div>;
  }

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`exp-body-${slug}`}
        className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        {head}
      </button>

      <div
        ref={panelRef}
        id={`exp-body-${slug}`}
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div
            className={`${bodyPaddingClass} transition-opacity duration-300 ${
              open ? "opacity-100 delay-75" : "opacity-0"
            }`}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
