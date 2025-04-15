import Image from "next/image";
import Link from "next/link";
import React from "react";

import { NavProgress } from "@/components/layout/NavProgress";
import logo from "@/public/images/logo-white.png";

export default function AuthHeader() {
  return (
    <div className="bg-secondary-600 shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 flex-col items-center">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <Image
                  priority
                  src={logo}
                  alt="Resonant Logo"
                  width={160}
                  height={160}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <NavProgress />
    </div>
  );
}
