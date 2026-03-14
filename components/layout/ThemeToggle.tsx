import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-4 left-4 z-40 rounded-full border border-foreground/20 bg-background/90 p-2 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-secondary-500/50 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-background md:left-6"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <SunIcon className="h-6 w-6" aria-hidden />
      ) : (
        <MoonIcon className="h-6 w-6" aria-hidden />
      )}
    </button>
  );
}
