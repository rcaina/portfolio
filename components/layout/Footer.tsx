import Link from "next/link";
import { cx } from "@/lib/utils";

import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="top-100 -t z-30 border-t bg-secondary-600 text-right text-highlight-200">
      <div
        className={cx(
          "flex",
          session
            ? "items-center justify-between border-primary-300 pr-8"
            : "justify-end p-4 pr-28"
        )}
      >
        <p>
          © 2024&nbsp;
          <Link href="/" className="font-medium text-primary-500">
            Renzo Caina
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
