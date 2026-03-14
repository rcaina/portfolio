import {
  AcademicCapIcon,
  BriefcaseIcon,
  FolderIcon,
  HomeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

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
  if (router.pathname !== "/") return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed left-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 md:left-6"
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
  );
}
