import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC } from "react";
import { NavProgress } from "components/layout/NavProgress";
import { cx } from "lib/utils";
import name_logo from "@/public/images/name_logo.png";
import Image from "next/image";

const links = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Education",
    href: "/education",
  },
  {
    label: "Experience",
    href: "/experience",
  },
  // {
  //   label: "Projects",
  //   href: "/projects",
  // },
  // {
  //   label: "tech-stack",
  //   href: "/tech-stack",
  // },
];

export const NavLinks: FC<{
  links: { label: string; href: string }[];
  activeClassName: string;
  defaultClassName: string;
}> = ({ links, activeClassName, defaultClassName }) => {
  const currentUrl = usePathname();

  return (
    <>
      {links.map((link) => (
        <Link
          href={link.href}
          key={link.label}
          className={cx(
            currentUrl === link.href ? activeClassName : defaultClassName
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export default function Header() {
  return (
    <>
      <Disclosure as="nav" className="sticky top-0 z-50 shadow shadow-white">
        {({ open }) => (
          <>
            <div className="container mx-auto bg-background px-4 sm:px-6 lg:px-8">
              <div className="flex h-16">
                <div className="flex flex-1">
                  <div className="flex flex-shrink-0 items-center">
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
                  <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
                    <NavLinks
                      links={links}
                      defaultClassName="mr-4 inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-md font-medium hover:border-black hover:font-bold hover:text-secondary-700"
                      activeClassName="font-bold mr-4 inline-flex items-center border-b-2 border-secondary-500 px-1 pt-1 text-md font-semibold"
                    />
                  </div>
                </div>
                <div className="hidden md:ml-6 md:flex md:items-center">
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                      </Menu.Button>
                    </div>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 bg-background pb-3 pt-2">
                <NavLinks
                  links={links}
                  defaultClassName="block border-l-4 border-transparent py-2 px-3 text-base font-medium text-gray-300 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  activeClassName="block border-l-4 border-foreground py-2 px-3 text-base font-bold text-foreground"
                />
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <NavProgress />
    </>
  );
}
