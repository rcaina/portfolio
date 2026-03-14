import { NAME } from "@/lib/contants";
import name_logo from "@/public/images/name_logo.png";
import Image from "next/image";
import Link from "next/link";
import { NavProgress } from "components/layout/NavProgress";

export default function Header() {
  return (
    <>
      <NavProgress />
      <Link
        href="/"
        className="group fixed left-4 top-4 z-50 flex h-12 w-12 flex-row items-center overflow-hidden rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-[width] duration-300 ease-out hover:w-[12rem] hover:border-foreground/40 hover:shadow-md md:left-6 md:top-6"
        aria-label="Home"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
          <Image
            priority
            src={name_logo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-cover"
          />
        </span>
        <span className="whitespace-nowrap pl-4 pr-3 text-base font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {NAME}
        </span>
      </Link>
    </>
  );
}
