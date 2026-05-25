import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "404, not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-4 py-24 font-mono text-sm">
      <div className="text-xs text-muted-foreground">
        ~ renzo.caina/ <span className="text-brand">$</span> cat page.tsx
      </div>

      <div className="rounded-md border border-foreground/15 bg-foreground/[0.02] px-4 py-3 text-destructive">
        <span className="text-muted-foreground">error:</span> cannot find module
        for this route.
      </div>

      <h1 className="font-mono text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-foreground">
        404, not found
      </h1>

      <p className="leading-relaxed text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try heading back home.
      </p>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-1.5 rounded-md border border-foreground/20 bg-foreground/[0.02] px-3 py-2 text-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <span aria-hidden className="text-brand/70 group-hover:text-brand">
            [
          </span>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          <span>back home</span>
          <span aria-hidden className="text-brand/70 group-hover:text-brand">
            ]
          </span>
        </Link>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        Tip: press{" "}
        <kbd className="rounded border border-foreground/20 bg-foreground/5 px-1.5 py-0.5 text-[10px] tracking-wider text-foreground">
          ⌘ K
        </kbd>{" "}
        to open the command palette.
      </div>
    </div>
  );
}
