"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  CommandLineIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import profile from "@/public/images/profile_img.jpg";
import { JOB_TITLE, NAME, socialLinks } from "@/lib/constants";
import { usePlatform } from "@/lib/usePlatform";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

const postLines: { text: string; muted?: boolean; break?: boolean }[] = [
  { text: `${JOB_TITLE} @ Belle.` },
  { text: "Previously Renew Biotechnologies, Fiddle, BYU.", muted: true },
  {
    text: "Currently shipping software for weight loss and longevity care.",
    muted: true,
    break: true,
  },
  {
    text: "Always happy to talk shop. Say hi.",
    muted: true,
  },
];

export default function Hero() {
  const { mounted, modKey } = usePlatform();
  const reducedMotion = useReducedMotion();
  const [first, last] = NAME.split(/\s+(?=[^ ]+$)/);

  return (
    <section
      id="hero"
      aria-labelledby="hero-name"
      className="relative w-full max-w-3xl scroll-mt-12 px-4 pt-20 md:scroll-mt-14 md:pt-20"
    >
      <motion.div
        initial="hidden"
        animate="show"
        className="flex flex-col gap-7 sm:gap-9"
      >
        <motion.div
          custom={0}
          variants={fadeUp}
          className="flex items-baseline justify-between gap-4 font-mono text-xs text-muted-foreground sm:text-sm"
        >
          <span className="select-none">
            ~ renzo.caina/ <span className="text-brand">$</span>{" "}
            <span className="text-foreground">whoami</span>
          </span>
          <span aria-hidden className="hidden text-foreground/60 sm:inline">
            v26.05 · branch/main
          </span>
        </motion.div>

        <div className="flex flex-col-reverse items-start gap-7 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <motion.h1
            custom={1}
            variants={fadeUp}
            id="hero-name"
            className="flex-1 font-mono text-[clamp(2.75rem,9.5vw,5.5rem)] font-bold leading-[0.88] tracking-[-0.05em] text-foreground"
          >
            <span className="block">{first}</span>
            <span className="block">
              {last ?? ""}
              <motion.span
                aria-hidden
                className="ml-2 inline-block h-[0.78em] w-[0.42ch] -translate-y-[8%] bg-brand align-middle"
                animate={reducedMotion ? undefined : { opacity: [1, 0, 1] }}
                transition={
                  reducedMotion
                    ? undefined
                    : { duration: 1.1, repeat: Infinity, ease: "linear" }
                }
              />
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex-shrink-0 self-start sm:mt-1"
          >
            <Image
              src={profile}
              alt={`Portrait of ${NAME}`}
              priority
              width={176}
              height={176}
              className="h-28 w-28 rounded-md border border-foreground/15 object-cover shadow-[0_14px_32px_-18px_hsl(var(--brand)/0.45)] sm:h-32 sm:w-32 md:h-40 md:w-40"
            />
          </motion.div>
        </div>

        <motion.div
          custom={2}
          variants={fadeUp}
          className="flex flex-col gap-2 font-mono text-sm text-foreground sm:text-base"
        >
          {postLines.map((line, i) => (
            <p
              key={i}
              className={`${
                line.muted ? "text-muted-foreground" : "text-foreground"
              } ${line.break ? "mt-3" : ""}`}
            >
              {line.text}
            </p>
          ))}
        </motion.div>

        <motion.div
          custom={3}
          variants={fadeUp}
          className="flex w-full flex-wrap items-center gap-3 font-mono text-xs sm:text-sm"
        >
          <HeroLink
            href="/files/renzo_caina.pdf"
            external
            primary
            icon={<ArrowDownTrayIcon className="h-4 w-4" aria-hidden />}
          >
            resume.pdf
          </HeroLink>
          <HeroLink
            href="#experience"
            icon={<CommandLineIcon className="h-4 w-4" aria-hidden />}
          >
            work
          </HeroLink>
          <HeroLink
            href="mailto:renzo.caina@outlook.com"
            decorated
            icon={<EnvelopeIcon className="h-4 w-4" aria-hidden />}
          >
            contact
          </HeroLink>
          <span className="ml-1 hidden text-muted-foreground sm:inline">
            or press
          </span>
          <kbd className="rounded border border-foreground/20 bg-foreground/5 px-1.5 py-1 font-mono text-[10px] tracking-wider text-foreground">
            {mounted ? `${modKey} K` : "⌘ K"}
          </kbd>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          className="flex items-center gap-2"
        >
          {socialLinks.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-foreground/15 text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <SocialIcon name={s.name} />
            </a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name.toLowerCase() === "github") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.6.111.82-.261.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.218.694.825.576C20.565 22.092 24 17.594 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  }
  if (name.toLowerCase() === "linkedin") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  return null;
}

function HeroLink({
  href,
  external,
  primary,
  decorated,
  icon,
  children,
}: {
  href: string;
  external?: boolean;
  primary?: boolean;
  decorated?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const base =
    "group inline-flex min-h-11 items-center gap-1.5 rounded-md px-3.5 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

  const variant = primary
    ? "border border-brand bg-brand text-background hover:bg-brand-muted hover:border-brand-muted"
    : "border border-foreground/20 bg-foreground/[0.02] text-foreground hover:border-foreground/40 hover:bg-foreground/5";

  const className = `${base} ${variant}`;

  const inner = (
    <>
      {decorated && (
        <span aria-hidden className="text-brand/70 group-hover:text-brand">
          [
        </span>
      )}
      {icon}
      <span>{children}</span>
      {decorated && (
        <span aria-hidden className="text-brand/70 group-hover:text-brand">
          ]
        </span>
      )}
    </>
  );

  if (external || href.startsWith("mailto:") || href.endsWith(".pdf")) {
    return (
      <a
        href={href}
        target={external || href.endsWith(".pdf") ? "_blank" : undefined}
        rel={
          external || href.endsWith(".pdf") ? "noopener noreferrer" : undefined
        }
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
