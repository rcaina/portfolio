import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

export function TechChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-foreground/15 bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-foreground/75">
      {children}
    </span>
  );
}

export function IntegrationChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-brand/30 bg-brand/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-brand/90">
      {children}
    </span>
  );
}

export function LinkChip({
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
