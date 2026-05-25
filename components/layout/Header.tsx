import { NAME } from "@/lib/constants";
import name_logo from "@/public/images/name_logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="contents">
      <Link
        href="/"
        className="group fixed left-4 top-4 z-50 grid h-12 grid-cols-[3rem_0fr] items-center overflow-hidden rounded-md border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-[grid-template-columns,border-color,box-shadow] duration-300 ease-out hover:grid-cols-[3rem_1fr] hover:border-foreground/40 hover:shadow-md focus:outline-none focus-visible:grid-cols-[3rem_1fr] focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-brand/60 md:left-6 md:top-6"
        aria-label={`${NAME}, home`}
      >
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md">
          <Image
            priority
            src={name_logo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-cover"
          />
        </span>
        <span className="min-w-0 overflow-hidden whitespace-nowrap pr-3 font-mono text-sm font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {NAME}
        </span>
      </Link>
    </header>
  );
}
