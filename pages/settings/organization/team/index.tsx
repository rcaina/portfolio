import { Address, OrganizationType, Role } from "@prisma/client";
import InviteTeamMemberModal, {
  InviteTeamMemberFormInputs,
} from "@/components/modals/InviteTeamMemberModal";

import Button from "@/components/common/Button";
import EmployeeListTable from "@/components/tables/practitioner/EmployeeListTable";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import SettingsSubMenu from "@/components/displays/SettingSubMenu";
import Spinner from "@/components/common/Spinner";
import { UserPlusIcon } from "@heroicons/react/20/solid";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  account: {
    role: Role;
    organization: {
      id: string;
      name: string;
      type: OrganizationType;
      addresses: Address[];
      billingAddresses: Address[];
    };
  };
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const account = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId ?? "",
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          type: true,
          addresses: true,
          billingAddresses: true,
        },
      },
    },
  });

  if (!account) {
    return {
      redirect: {
        destination: "/settings/organization",
        permanent: false,
      },
    };
  }

  return {
    props: { account: JSON.parse(JSON.stringify(account)) },
  };
};

const ClinicTeamPage = ({ account }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [openInviteTeamMemberModal, setOpenInviteTeamMemberModal] =
    useState(false);

  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const onInviteTeamMember = async (data: InviteTeamMemberFormInputs) => {
    if (!session?.user.id) return;

    await fetch("/api/user/employee-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clinicId: account?.organization.id,
        ...data,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          const res = await response.json();
          toast.success(res.message || "Email invitation sent successfully");
          setOpenInviteTeamMemberModal(false);
          router.replace(router.asPath, undefined, {
            scroll: false,
          });
        } else {
          const res = await response.json();
          toast.error(res.error || "An error occurred sending the invitation");
        }
      })
      .catch((error) => {
        console.error("Error inviting team member:", error);
        toast.error("An error occurred sending the invitation");
      });
  };

  return (
    <SettingsSubMenu activeSection={"team"}>
      <div className="flex max-h-screen">
        {account?.organization ? (
          <div className="flex w-full flex-col gap-4">
            <div className=" h-full">
              <div className="sticky top-0 z-20">
                <PageHeader title="Team Members" showLock={isLocked} />
              </div>
              <div className="flex h-full flex-col items-start gap-4 overflow-y-auto">
                <div className="flex w-full flex-col items-start gap-2 p-8">
                  <div className="flex w-full items-center justify-between">
                    <div className="w-2/3">
                      <div className="mb-2 flex items-center">
                        <h2 className="text-lg font-bold ">
                          {account?.organization.name} Team Members
                        </h2>
                      </div>
                      <p className="flex items-center ">
                        Explore the full list of team members with access to{" "}
                        {account?.organization.name}&apos;s portal, where you
                        can view current collaborators and their roles. Admins
                        can also invite additional team members to join the
                        research portal as needed.
                      </p>
                    </div>
                    {(organizationAllowedRoles.includes(account.role) ||
                      account.role === Role.ADMIN) && (
                      <div className="mr-4 mt-4">
                        <Button
                          onClick={() => setOpenInviteTeamMemberModal(true)}
                          variant="secondary"
                          size="md"
                        >
                          <UserPlusIcon className="mr-2 h-5 w-5" />
                          Invite Team Member
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <EmployeeListTable
                      organizationId={account?.organization.id}
                      isClinic={
                        account.organization.type === OrganizationType.CLINICAL
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Spinner className="h-14 w-14" />
            <p className="">Loading...</p>
          </div>
        )}
        {openInviteTeamMemberModal && (
          <InviteTeamMemberModal
            open={openInviteTeamMemberModal}
            setOpen={setOpenInviteTeamMemberModal}
            onSubmit={onInviteTeamMember}
            type={account?.organization.type}
          />
        )}
      </div>
    </SettingsSubMenu>
  );
};

export default ClinicTeamPage;
