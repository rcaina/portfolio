import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="group fixed bottom-4 left-4 z-40 flex h-12 w-12 flex-row items-center overflow-hidden rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-[width] duration-300 ease-out hover:w-[11rem] hover:border-foreground/40 hover:shadow-md md:bottom-6 md:left-6">
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <SunIcon className="h-5 w-5" aria-hidden />
        ) : (
          <MoonIcon className="h-5 w-5" aria-hidden />
        )}
      </button>
      <span className="whitespace-nowrap pl-4 pr-3 text-sm font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </div>
  );
}
