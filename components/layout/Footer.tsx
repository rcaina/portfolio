import { Account } from "@prisma/client";
import { Address } from "@prisma/client";
import Link from "next/link";
import { Organization } from "@prisma/client";
import { cx } from "@/lib/utils";
import { menuItems } from "./SideNav";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: accounts } = useSWR<
    (Account & {
      organization: Organization & { billingAddresses: Address[] };
    })[]
  >(session?.user.currentAccountId ? `/api/account` : null);

  const handleSwitch = async (organizationId: string) => {
    if (session?.user.organizationId === organizationId) {
      toast.warn(`You are already in this organization`);
      return false;
    }

    await fetch(`/api/user/switch-organization`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ organizationId }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Error switching organizations");
      })
      .then(async () => {
        window.location.href = "/";
      })
      .catch((err) => {
        toast.error(err.message);
      });

    return true;
  };

  const menu = session?.user
    ? menuItems(session?.user, router, accounts, handleSwitch)
    : null;

  return (
    <footer className="top-100 -t z-30 border-t bg-secondary-600 text-right text-highlight-200">
      <div
        className={cx(
          "flex",
          session
            ? "items-center justify-between border-primary-300 pr-8"
            : "justify-end p-4 pr-28"
        )}
      >
        {menu}
        <p>
          © 2024&nbsp;
          <Link href="/" className="font-medium text-primary-500">
            Resonant
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
