import { Disclosure } from "@headlessui/react";
import Link from "next/link";
import React from "react";
import { NavProgress } from "components/layout/NavProgress";
import name_logo from "@/public/images/name_logo.png";
import Image from "next/image";

export default function Header() {
  return (
    <>
      <Disclosure as="nav" className="sticky top-0 z-50">
        {() => (
          <div className="w-full bg-background px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <Link
                href="/"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/20"
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
            </div>
          </div>
        )}
      </Disclosure>
      <NavProgress />
    </>
  );
}
