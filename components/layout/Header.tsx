import React, { FC, ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/utils";
import logo from "@/public/images/logo-white.png";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export const NavLinks: FC<{
  links: { label: string; href: string; icon: ReactNode }[];
  activeClassName: string;
  defaultClassName: string;
}> = ({ links, activeClassName, defaultClassName }) => {
  const currentUrl = usePathname();

  return (
    <div className="h-full">
      {links.map((link) => (
        <Link key={link.label} href={link.href} passHref>
          <div
            className={cx(
              currentUrl.includes(link.href)
                ? activeClassName
                : defaultClassName,
              "flex w-full cursor-pointer items-center pl-6"
            )}
          >
            <div className=" mr-2">{link.icon}</div>
            {link.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default function Header() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-center bg-secondary-600 text-primary-500">
      <div
        className={cx(
          "flex w-full",
          session ? "justify-between" : "justify-center"
        )}
      >
        <div className="ml-3 flex items-center justify-center">
          <Link href="/">
            <Image
              priority
              src={logo}
              alt="Resonant Logo"
              width={190}
              height={190}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
