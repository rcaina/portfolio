import Link from "next/link";
import React from "react";
import { NavProgress } from "components/layout/NavProgress";
import name_logo from "@/public/images/name_logo.png";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <NavProgress />
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/20 bg-background/90 shadow-sm backdrop-blur-sm transition-colors hover:border-foreground/40 hover:shadow-md md:left-6 md:top-6"
        aria-label="Home"
      >
        <Image
          priority
          src={name_logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 object-cover"
        />
      </Link>
    </>
  );
}
