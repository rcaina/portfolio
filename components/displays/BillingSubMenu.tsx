import { DocumentTextIcon } from "@heroicons/react/20/solid";
import { OrganizationType } from "@prisma/client";
import PageHeader from "../layout/PageHeader";
import React from "react";
import { useRouter } from "next/router";

interface BillingSubMenuProps {
  activeSection: string;
  organizationType: OrganizationType;
  children: React.ReactNode;
}

const organizationBillingMenuItems = [
  {
    label: "Services",
    href: "/billing/invoices/services",
    icon: <DocumentTextIcon className="mr-2 h-5 w-5" />,
    key: "services",
  },
  {
    label: "Kits",
    href: "/billing/invoices/kits",
    icon: <DocumentTextIcon className="mr-2 h-5 w-5" />,
    key: "kits",
  },
];

const researchBillingcMenuItems = [
  {
    label: "Services",
    href: "/billing/invoices/services",
    icon: <DocumentTextIcon className="mr-2 h-5 w-5" />,
    key: "services",
  },
];

const BillingSubMenu = ({
  activeSection,
  organizationType,
  children,
}: BillingSubMenuProps) => {
  const router = useRouter();

  const setMenuItems =
    organizationType === OrganizationType.CLINICAL
      ? organizationBillingMenuItems
      : researchBillingcMenuItems;

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-72 flex-col">
        <div className="h-full bg-secondary-100">
          <PageHeader title="Billing" showLock={false} withOutlines={false} />
          <hr className="border-1 mb-6 border-primary-500" />
          <ul className="flex flex-col">
            {setMenuItems.map((item) => (
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
      <div className="flex w-full flex-col gap-4">{children}</div>
    </div>
  );
};

export default BillingSubMenu;
