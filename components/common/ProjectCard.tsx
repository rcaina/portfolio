"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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

const ProjectCard: React.FC<{ project: Project; defaultOpen?: boolean }> = ({
  project,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const liveLabel = project.technologies.includes("Webflow")
    ? "visit site"
    : "try demo";
  const isPortfolio = project.title.toLowerCase().includes("portfolio");
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="group rounded-md border border-foreground/10 bg-foreground/[0.015] transition-colors hover:border-foreground/25">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`proj-body-${slug}`}
        className="flex w-full items-start gap-4 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:px-5"
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-foreground/10 bg-background sm:h-12 sm:w-12">
          <Image
            src={project.image}
            alt={`${project.title} logo`}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="truncate font-mono text-base font-semibold text-foreground sm:text-lg">
              {project.title}
            </span>
            {project.link && !isPortfolio && (
              <span className="flex-shrink-0 font-mono text-xs text-brand">
                live
              </span>
            )}
          </div>
          {!open && (
            <p className="line-clamp-2 font-mono text-xs text-muted-foreground sm:text-sm">
              {project.description}
            </p>
          )}
          {!open && project.technologies.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {project.technologies.slice(0, 5).map((t) => (
                <TechChip key={t}>{t}</TechChip>
              ))}
              {project.technologies.length > 5 && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  +{project.technologies.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>

        <span
          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-foreground/15 text-muted-foreground transition-all duration-300 ease-out group-hover:border-foreground/30 group-hover:text-foreground ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </span>
      </button>

      <div
        id={`proj-body-${slug}`}
        role="region"
        aria-hidden={!open}
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div
            className={`border-t border-foreground/10 px-4 py-4 transition-opacity duration-300 sm:px-5 ${
              open ? "opacity-100 delay-75" : "opacity-0"
            }`}
          >
            <p className="font-mono text-xs leading-relaxed text-foreground/85 sm:text-sm">
              {project.description}
            </p>

            {project.technologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <TechChip key={t}>{t}</TechChip>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs">
              {project.link && !isPortfolio && (
                <LinkChip href={project.link}>{liveLabel}</LinkChip>
              )}
              {project.github_links?.map((link, i) => (
                <LinkChip key={link} href={link}>
                  {project.github_links!.length > 1
                    ? `source ${i + 1}`
                    : "source"}
                </LinkChip>
              ))}
            </div>

            {project.demo_account_info && (
              <div className="mt-4 rounded-md border border-dashed border-foreground/15 bg-foreground/[0.02] p-3 font-mono text-xs">
                <p className="mb-1 text-muted-foreground">
                  <span aria-hidden className="text-brand/70">
                    #
                  </span>{" "}
                  demo credentials
                </p>
                <p className="text-foreground/85">
                  <span className="text-muted-foreground">email:</span>{" "}
                  {project.demo_account_info.email}
                </p>
                <p className="text-foreground/85">
                  <span className="text-muted-foreground">password:</span>{" "}
                  {project.demo_account_info.password}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function TechChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-foreground/15 bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-foreground/75">
      {children}
    </span>
  );
}

function LinkChip({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link inline-flex min-h-11 items-center gap-1.5 rounded-md border border-foreground/15 bg-foreground/[0.02] px-3 py-2 text-foreground/80 transition-colors hover:border-foreground/40 hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <span>{children}</span>
      <ArrowUpRightIcon
        className="h-3 w-3 opacity-60 group-hover/link:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

export default ProjectCard;
