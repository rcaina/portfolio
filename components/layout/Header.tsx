import { Disclosure } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";
import { NavProgress } from "components/layout/NavProgress";
import name_logo from "@/public/images/name_logo.png";
import full_name_logo from "@/public/images/full_name_logo.png";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Header() {
  const { setTheme, theme } = useTheme();
  return (
    <>
      <Disclosure
        as="nav"
        className="sticky top-0 z-50 shadow shadow-foreground"
      >
        {() => (
          <div className="w-full bg-background px-4 sm:px-6 lg:px-8">
            <div className="flex h-16">
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="hidden items-center md:flex">
                    <Link href="/">
                      <Image
                        priority
                        src={full_name_logo}
                        alt="Full_Name"
                        width={175}
                        height={36}
                        className="rounded-xl border border-black bg-white pl-2 pr-[3px]"
                      />
                    </Link>
                  </div>
                  <div className="flex flex-shrink-0 items-center md:hidden">
                    <Link href="/">
                      <Image
                        priority
                        src={name_logo}
                        alt="Name"
                        width={50}
                        height={36}
                        className="rounded-full border border-black"
                      />
                    </Link>
                  </div>
                </div>
                <div className="md:w-auto">
                  <div
                    className="rounded-full border border-foreground p-2 text-foreground hover:bg-secondary-500"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <SunIcon className="h-6 w-6" />
                    ) : (
                      <MoonIcon className="h-6 w-6" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Disclosure>
      <NavProgress />
    </>
  );
}
