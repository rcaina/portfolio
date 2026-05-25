"use client";

import { useEffect, useState } from "react";

const TOTAL_LINES = 32;

export default function EditorGutter() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        setActive(Math.round(p * (TOTAL_LINES - 1)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="border-border/30 pointer-events-none fixed inset-y-0 left-1/2 z-30 hidden w-12 -translate-x-[27rem] border-r lg:block"
    >
      <div className="text-muted-foreground/35 flex h-screen flex-col justify-between py-6 pr-2 text-right font-mono text-[10px] leading-none">
        {Array.from({ length: TOTAL_LINES }, (_, i) => {
          const isActive = i === active;
          return (
            <span
              key={i}
              className={
                isActive
                  ? "text-foreground/90 transition-colors"
                  : "transition-colors"
              }
            >
              {String(i + 1).padStart(2, "0")}
              {isActive ? " ▸" : "  "}
            </span>
          );
        })}
      </div>
    </div>
  );
}
