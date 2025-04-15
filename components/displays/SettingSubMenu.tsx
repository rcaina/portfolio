import {
  BuildingOffice2Icon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import PageHeader from "../layout/PageHeader";
import React from "react";
import { useRouter } from "next/router";

interface SettingsSubMenuProps {
  activeSection: string;
  children: React.ReactNode;
}

const SettingsSubMenu = ({ activeSection, children }: SettingsSubMenuProps) => {
  const router = useRouter();

  const menuItems = [
    {
      label: "Individual",
      href: "/settings/personal",
      icon: (
        <UserIcon className="mr-2 h-5 w-5 rounded-full border border-secondary-600" />
      ),
      key: "personal",
    },
    {
      label: "Organization",
      href: "/settings/organization",
      icon: <BuildingOffice2Icon className="mr-2 h-5 w-5" />,
      key: "organization",
    },
    {
      label: "Team Members",
      href: "/settings/organization/team",
      icon: <UserGroupIcon className="mr-2 h-5 w-5" />,
      key: "team",
    },
  ];

  return (
    <div className="flex w-full">
      <div className="flex w-72 flex-col">
        <div className="h-full bg-secondary-100">
          <PageHeader title="Settings" showLock={false} withOutlines={false} />
          <hr className="border-1 mb-6 border-primary-500" />
          <ul className="flex flex-col">
            {menuItems.map((item) => (
              <li
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`flex w-full cursor-pointer items-center p-2 pl-4 text-left font-medium hover:bg-secondary-600 hover:text-primary-500 ${
                  activeSection === item.key ? "bg-primary-600" : ""
                }`}
              >
                {item.icon}
                <div>{item.label}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex w-full flex-col">{children}</div>
    </div>
  );
};

export default SettingsSubMenu;
