"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Slide, ToastContainer as Toaster } from "react-toastify";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider delayDuration={400}>
        {children}
        <Toaster position="bottom-right" transition={Slide} />
      </TooltipProvider>
    </NextThemesProvider>
  );
}
