"use client";

import { useEffect, useState } from "react";

export default function DotGridBackground() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffset(window.scrollY * 0.15));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        maskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 90%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 90%)",
      }}
    >
      <div
        className="absolute inset-x-0"
        style={{
          top: "-100vh",
          bottom: "-100vh",
          backgroundImage:
            "radial-gradient(circle at center, oklch(var(--foreground) / 0.09) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          transform: `translate3d(0, ${-offset}px, 0)`,
        }}
      />
    </div>
  );
}
