import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 Page Not Found — Portfolio",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex h-full w-full grow items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        404 — Page Not Found
      </h2>
    </div>
  );
}
