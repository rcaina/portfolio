"use client";

import dynamic from "next/dynamic";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { usePlatform } from "@/lib/usePlatform";

const CommandDialog = dynamic(() => import("./CommandDialog"), { ssr: false });

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { mounted, modKey } = usePlatform();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setHasOpened(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        triggerRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    setHasOpened(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="bg-background/90 group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 items-center gap-2 rounded-md border border-foreground/20 px-4 font-mono text-xs text-foreground shadow-sm transition-all duration-200 hover:border-foreground/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background md:bottom-6 md:right-6"
        aria-label="Open command palette"
      >
        <SparklesIcon className="h-4 w-4 text-brand" aria-hidden />
        <span className="hidden sm:inline">Command</span>
        <kbd className="rounded border border-foreground/20 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] tracking-wider">
          {mounted ? `${modKey} K` : "⌘ K"}
        </kbd>
      </button>

      {hasOpened && open && (
        <CommandDialog
          onClose={() => setOpen(false)}
          modKey={modKey}
          mounted={mounted}
        />
      )}
    </>
  );
}
