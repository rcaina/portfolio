import {
  AcademicCapIcon,
  Bars3Icon,
  BriefcaseIcon,
  FolderIcon,
  HomeIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home", icon: HomeIcon },
  { id: "experience", label: "Experience", icon: BriefcaseIcon },
  { id: "projects", label: "Projects", icon: FolderIcon },
  { id: "other-projects", label: "Other Projects", icon: Squares2X2Icon },
  { id: "education", label: "Education", icon: AcademicCapIcon },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function SideNav() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (router.pathname !== "/") return null;

  const handleSectionClick = (id: string) => {
    scrollToSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile: menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:border-foreground/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background md:hidden"
        aria-label="Open section menu"
      >
        <Bars3Icon className="h-5 w-5 text-foreground" aria-hidden />
      </button>

      {/* Mobile: blurred overlay, icon pills that expand (no panel bg) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Section navigation"
        className={`fixed inset-0 z-50 md:hidden ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-foreground/15 backdrop-blur-md transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-label="Close menu"
        />
        <div
          className={`absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-foreground/20 bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="group flex h-12 w-12 flex-row items-center justify-end overflow-hidden rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-[width] duration-300 ease-out focus-within:w-[11rem] focus-within:border-foreground/40 hover:w-[11rem] hover:border-foreground/40 hover:shadow-md"
            >
              <span className="whitespace-nowrap pl-3 pr-4 text-sm font-medium text-foreground opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                {label}
              </span>
              <button
                type="button"
                onClick={() => handleSectionClick(id)}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background"
                aria-label={`Go to ${label}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: fixed side nav (unchanged, hidden on mobile) */}
      <nav
        aria-label="Section navigation"
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:left-6 md:flex"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className="group flex h-12 w-12 flex-row items-center overflow-hidden rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-[width] duration-300 ease-out hover:w-[11rem] hover:border-foreground/40 hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => scrollToSection(id)}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background"
              aria-label={`Go to ${label}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </button>
            <span className="whitespace-nowrap pl-4 pr-3 text-sm font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </>
  );
}
