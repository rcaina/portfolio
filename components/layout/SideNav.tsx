import { Account, Address, Organization, Role } from "@prisma/client";
import {
  ArrowUpOnSquareIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  FolderIcon,
  PhoneArrowUpRightIcon,
} from "@heroicons/react/24/outline";
import {
  EyeDropperIcon,
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";
import { Fragment, ReactElement, cloneElement } from "react";
import { MIN_ACCOUNTS, getGravatarURL } from "@/lib/utils";
import { NextRouter, useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { NavProgress } from "./NavProgress";
import { Transition } from "@headlessui/react";
import { User } from "next-auth";
import { cx } from "class-variance-authority";
import logo from "@/public/images/logo-white.png";

const practitionerLinks = [
  {
    label: "Dashboard",
    href: "/",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Kit Orders",
    href: "/clinical/kit",
    icon: <ShoppingCartIcon className="h-5 w-5" />,
  },
  {
    label: "Kit Assignment",
    href: "/clinical/service",
    icon: <EyeDropperIcon className="h-5 w-5" />,
  },
  {
    label: "Patient List",
    href: "/clinical/patient",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    label: "Tests Status",
    href: "/clinical/test-statuses",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
  },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const staffLinks = [
  {
    label: "Dashboard",
    href: "/",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Kit Orders",
    href: "/clinical/kit",
    icon: <ShoppingCartIcon className="h-5 w-5" />,
  },
  {
    label: "Patient List",
    href: "/clinical/patient",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const researchAdminLinks = [
  {
    label: "Dashboard",
    href: "/research/dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: "/research/projects",
    icon: <FolderIcon className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/research/orders",
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
  },
  {
    label: "Specimen",
    href: "/research/specimen",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
  },
  // {
  //   label: "Submit Samples",
  //   href: "/research/specimen/submit",
  //   icon: <DocumentPlusIcon className="h-5 w-5" />,
  // },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const researchLinks = [
  {
    label: "Dashboard",
    href: "/research/dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: "/research/projects",
    icon: <FolderIcon className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/research/orders",
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
  },
  {
    label: "Specimen",
    href: "/research/specimen",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
  },
  // {
  //   label: "Submit Samples",
  //   href: "/research/specimen/submit",
  //   icon: <DocumentPlusIcon className="h-5 w-5" />,
  // },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const dataAnalystLinks = [
  {
    label: "Dashboard",
    href: "/research/dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: "/research/projects",
    icon: <FolderIcon className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/research/orders",
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
  },
  {
    label: "Specimen",
    href: "/research/specimen",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
  },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const projectManagerLinks = [
  {
    label: "Dashboard",
    href: "/research/dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: "/research/projects",
    icon: <FolderIcon className="h-5 w-5" />,
  },
  {
    label: "Orders",
    href: "/research/orders",
    icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
  },
  {
    label: "Specimen",
    href: "/research/specimen",
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
  },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const billingManagerLinks = [
  {
    label: "Dashboard",
    href: "/billing",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    label: "Contact Support",
    href: "/support",
    icon: <PhoneArrowUpRightIcon className="h-5 w-5" />,
  },
];

const IconWrapper = ({
  icon,
  isActive,
}: {
  icon: ReactElement;
  isActive: boolean;
}) => {
  if (!icon) return null;
  return cloneElement(icon, {
    className: `h-5 w-5 ${
      isActive ? "fill-primary-350 " : "group-hover:fill-primary-300 "
    }`,
  });
};

const billingRolesAllowed: Role[] = [Role.BILLING_MANAGER, Role.ADMIN];

export const menuItems = (
  user: User,
  router: NextRouter,
  accounts:
    | (Account & {
        organization: Organization & { billingAddresses: Address[] };
      })[]
    | undefined,
  handleSwitch: (organizationId: string) => void
) => {
  return (
    <Menu as="div" className="relative z-40 inline-block text-left">
      <Menu.Button className="flex w-full items-center justify-between gap-20 bg-secondary-600 p-5 pl-5 text-lg text-primary-100">
        <h2 className="">{user.name}</h2>
        <span className="sr-only">Open user menu</span>
        <Image
          className="border-highlight-60 h-8 w-8 rounded-full border"
          src={user.image || getGravatarURL(user.email || "")}
          width={32}
          height={32}
          alt=""
        />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-[100%] mb-1 ml-2 min-w-52 rounded-md border-[1px] bg-secondary-600 shadow-gray-400 ring-black ring-opacity-5">
          {" "}
          <Menu.Item>
            <div className="flex items-center gap-3 px-2 py-2 text-sm">
              <div className="flex-shrink-0">
                <Image
                  src={user?.image || getGravatarURL(user.email || "")}
                  alt="Description"
                  width={40}
                  height={40}
                  className="border-1 rounded-full border-highlight-600 shadow-md shadow-primary-500"
                />
              </div>
              <div className="flex-grow cursor-default justify-center">
                <h1>{user.name}</h1>
              </div>
            </div>
          </Menu.Item>
          <Menu.Item key={"email"}>
            <div className="flex cursor-default items-center gap-3 px-6 py-2 text-sm">
              <p>{user.email}</p>
            </div>
          </Menu.Item>
          <hr className="border-1 border-primary-500" />
          <Menu.Item key={"sign-out"}>
            <div
              className="flex cursor-pointer items-center gap-3 px-6 py-2 text-sm hover:bg-primary-300 hover:text-secondary-600"
              onClick={() => signOut()}
            >
              <div className="flex-shrink-0">
                <ArrowUpOnSquareIcon className="h-5 w-5" />
              </div>
              <div className="flex-grow">Sign out</div>
            </div>
          </Menu.Item>
          {user.role && billingRolesAllowed.includes(user.role) && (
            <Menu.Item key={"billing"}>
              <div
                className="flex cursor-pointer items-center gap-3 px-6 py-2 text-sm hover:bg-primary-300 hover:text-secondary-600"
                onClick={() => router.push("/billing/invoices/services")}
              >
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-5 w-5" />
                </div>
                <div className="flex-grow">Billing</div>
              </div>
            </Menu.Item>
          )}
          <Menu.Item key={"settings"}>
            <div
              className="flex cursor-pointer items-center gap-3 px-6 py-2 text-sm hover:bg-primary-300 hover:text-secondary-600"
              onClick={() => router.push("/settings/personal")}
            >
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-5 w-5" />
              </div>
              <div className="flex-grow">Settings</div>
            </div>
          </Menu.Item>
          {accounts && accounts.length > MIN_ACCOUNTS && (
            <Menu.Item>
              <div>
                <Menu as="div" className="relative">
                  <div>
                    <Menu.Button className="flex w-full cursor-pointer items-center gap-3 px-6 py-2 text-sm hover:bg-primary-300 hover:text-secondary-600">
                      <div className="flex-shrink-0">
                        <BuildingOffice2Icon className="h-5 w-5" />
                      </div>
                      <div>Switch Clinics</div>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      className={`absolute left-40 z-20 mt-2 w-full origin-bottom-left rounded-md border-2 border-primary-300 bg-secondary-600 py-1 ring-opacity-5 focus:outline-none`}
                    >
                      {accounts.map((item, index) => (
                        <Menu.Item key={item.id || index}>
                          <div
                            className={`cursor-pointer px-4 py-2 text-sm hover:bg-primary-300 hover:text-secondary-600`}
                            onClick={() => handleSwitch(item.organizationId)}
                          >
                            {item.organization.name}
                          </div>
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </Menu.Item>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const linksMap = {
  [Role.ADMIN]: researchAdminLinks,
  [Role.BILLING_MANAGER]: billingManagerLinks,
  [Role.DATA_ANALYST]: dataAnalystLinks,
  [Role.PROJECT_MANAGER]: projectManagerLinks,
  [Role.RESEARCHER]: researchLinks,
  [Role.PRACTITIONER]: practitionerLinks,
  [Role.STAFF]: staffLinks,
};

export const SideNav = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUrl = router.pathname.endsWith("/[id]")
    ? router.pathname.slice(0, -5)
    : router.pathname;
  const links = session?.user.role ? linksMap[session?.user.role] : [];

  return (
    <aside className="sticky top-0 hidden bg-secondary-600 text-primary-100 shadow sm:w-36 md:block md:w-48 lg:w-64">
      <div
        className={cx(
          "border-primary-350 flex w-full border-b",
          session ? "justify-between" : "justify-center"
        )}
      >
        <div className="ml-3 flex items-center justify-center">
          <Link href="/">
            <Image priority src={logo} alt="logo" width={190} height={190} />
          </Link>
        </div>
      </div>
      <NavProgress />
      <div className="flex h-full flex-col">
        <nav>
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              className={cx(
                currentUrl === link.href
                  ? "border-primary-350 text-md group flex w-full border bg-secondary-700 p-4 pl-6 font-medium text-primary-100 hover:bg-secondary-600 hover:text-primary-300"
                  : "text-md group flex w-full p-4 pl-6 font-medium hover:bg-secondary-700 hover:text-primary-100"
              )}
            >
              <div className="mr-2">
                {link.icon && (
                  <IconWrapper
                    icon={link.icon || null}
                    isActive={currentUrl === link.href}
                  />
                )}
              </div>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
