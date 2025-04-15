import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import { Account, Employee, License, OrganizationType } from "@prisma/client";
import EditUserProfileModal, {
  EditUserProfileFormInputs,
} from "@/components/modals/EditUserProfileModal";
import { capitalize, isEmpty } from "lodash-es";

import Button from "@/components/common/Button";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { GetServerSideProps } from "next";
import Input from "@/components/common/Input";
import LicenseStatusBadge from "@/components/misc/badges/LicenseStatusBadge";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import PageHeader from "@/components/layout/PageHeader";
import SettingsSubMenu from "@/components/displays/SettingSubMenu";
import { ShieldCheckIcon } from "@heroicons/react/20/solid";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dayjs from "dayjs";
import { formatPhoneNumber } from "@/lib/utils";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Props {
  user: Employee & { licenses: License[] };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.email) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const user = await prisma.employee.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  return {
    props: { user: JSON.parse(JSON.stringify(user)) },
  };
};

const PersonalPage = ({ user }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  // const [pendingVerification, setPendingVerification] = useState(false);
  const [viewLicenses, setViewLicenses] = useState("licenses");
  // const [openImageModal, setOpenImageModal] = useState(false);
  // const [openAddLicenseModal, setOpenAddLicenseModal] = useState(false);
  // const [openEditLicenseModal, setOpenEditLicenseModal] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  // const [openEditPassword, setOpenResetPassword] = useState(false);
  // const [editingLicense, setEditingLicense] = useState<License | undefined>();
  const { data: currentAccount } = useSWR<
    Account & { organization: { type: OrganizationType } }
  >(session?.user.id ? `/api/current/account/${session.user.id}` : null, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const onUpdateProfile: SubmitHandler<EditUserProfileFormInputs> = async (
    data
  ) => {
    await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Profile updated successfully");
          setOpenEditProfile(false);
          router.replace(router.asPath, undefined, {
            scroll: false,
          });
        } else {
          const res = await response.json();
          toast.error(res.error ?? "Error updating profile");
        }
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  return (
    <SettingsSubMenu activeSection={"personal"}>
      <div className="flex max-h-screen">
        <div className="flex w-full flex-col overflow-y-auto">
          <div className="h-full">
            <div className="sticky top-0 z-20">
              <PageHeader title="Personal" showLock={isLocked} />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex w-full flex-col items-start gap-4 p-8">
                <div className="flex w-full flex-col gap-6">
                  {/* <div className="flex w-full items-center">
                    <div className="flex items-center">
                      {session?.user.image ? (
                        <div
                          className="relative flex-shrink-0"
                          onClick={() => setOpenImageModal(true)}
                        >
                          <Image
                            src={session?.user.image ?? ""}
                            alt="Description"
                            width={35}
                            height={35}
                            className="mr-2 rounded-full border border-highlight-600 shadow-lg shadow-highlight-600"
                          />
                        </div>
                      ) : (
                        <div className="relative flex-shrink-0">
                          <UserCircleIcon className="mr-2 h-6 w-6 text-primary-500" />
                        </div>
                      )}
                      <h2 className="text-lg font-bold ">Profile</h2>
                    </div>
                  </div> */}
                  <div className="flex justify-between gap-2 rounded-sm border border-highlight-600 p-8 shadow-lg shadow-highlight-600">
                    <div className="grid w-full grid-cols-2 gap-2">
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          First Name
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {user?.firstName}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">Last Name</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {user?.lastName}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">Email</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {user?.email}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          Phone Number
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {user?.phoneNumber
                            ? formatPhoneNumber(user.phoneNumber)
                            : "N/A"}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          NPI Number
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {user?.nationalProviderId}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">Role</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {capitalize(currentAccount?.role)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          Account Type
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {currentAccount?.accountOwner
                            ? "Account Owner"
                            : "Member"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        onClick={() => {
                          setOpenEditProfile(true);
                        }}
                        variant="secondary"
                        size="md"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
                <hr className="border-1 mt-4 w-full border-highlight-300" />
                {currentAccount?.organization.type ===
                  OrganizationType.CLINICAL &&
                  !isEmpty(user?.licenses) && (
                    <>
                      <Accordion
                        type="single"
                        collapsible
                        className="flex w-full flex-col"
                        value="licenses"
                      >
                        <AccordionItem value={viewLicenses}>
                          <AccordionTrigger
                            onClick={() =>
                              setViewLicenses(
                                viewLicenses === "licenses" ? "" : "licenses"
                              )
                            }
                          >
                            <div className="flex flex-row items-center">
                              <CreditCardIcon className="mr-2 h-8 w-8" />
                              <h2 className="text-lg font-bold ">Licenses</h2>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="overflow-visible">
                            <div className="grid grid-cols-2 gap-4">
                              {user.licenses.map((license: License) => (
                                <div
                                  className="flex w-full flex-row rounded-sm border border-highlight-600 p-6 pb-4 pt-2 shadow-lg shadow-highlight-600"
                                  key={license.id}
                                >
                                  <div className="grid w-4/5 grid-cols-2 gap-2">
                                    <div className="col-span-1">
                                      <label className="text-md font-medium">
                                        License Number
                                      </label>
                                      <div className="pl-4 text-sm text-highlight-600">
                                        {license.number}
                                      </div>
                                    </div>
                                    <div className="col-span-1">
                                      <label className="text-md font-medium">
                                        State
                                      </label>
                                      <div className="pl-4 text-sm text-highlight-600">
                                        {license.state}
                                      </div>
                                    </div>
                                    {license.effectiveDate && (
                                      <div className="col-span-1">
                                        <label className="text-md font-medium">
                                          Effective Date
                                        </label>
                                        <div className="pl-4 text-sm text-highlight-600">
                                          {dayjs(license.effectiveDate).format(
                                            MEDIUM_DATE_FORMAT
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    <div className="col-span-1">
                                      <label className="text-md font-medium">
                                        Expiration Date
                                      </label>
                                      <div className="pl-4 text-sm text-highlight-600">
                                        {dayjs(license.expirationDate).format(
                                          MEDIUM_DATE_FORMAT
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex w-1/5 items-center">
                                    <div className="text-md text-highlight-600">
                                      <LicenseStatusBadge
                                        status={license.status}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* {currentAccount?.role === Role.PRACTITIONER && (
                        <Button
                          className="mt-4 self-start"
                          onClick={() => {
                            setOpenAddLicenseModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          Icon={<PlusCircleIcon className="h-4 w-4" />}
                        >
                          Add License
                        </Button>
                      )}
                      <hr className="border-1 w-full border-highlight-600" /> */}
                    </>
                  )}
                <div className="flex w-full flex-col gap-3 rounded-md pt-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="mb-2 mr-2 h-8 w-8" />
                      <h2 className="mb-2 text-lg font-bold ">Security</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center rounded-sm border border-highlight-600 p-8 shadow-lg shadow-highlight-600">
                    <div className="col-span-1">
                      <Input
                        label="Password"
                        type="password"
                        value="password12345"
                        disabled={true}
                      />
                    </div>
                    {/* <div className="flex flex-row justify-end">
                      <Button
                        onClick={() => setOpenResetPassword(true)}
                        variant="secondary"
                        size="md"
                      >
                        Reset Password
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* {openImageModal && (
          <EditUserProfileImageModal
            open={openImageModal}
            setOpen={setOpenImageModal}
            onSubmit={onUpdateProfileImage}
            onRemove={onRemoveImage}
            data={{ imageUrl: clerkUser?.imageUrl }}
          />
        )}
        {openAddLicenseModal && (
          <AddEditLicenseModal
            open={openAddLicenseModal}
            setOpen={setOpenAddLicenseModal}
            onSubmit={onAddEditLicense}
          />
        )}
        {editingLicense && openEditLicenseModal && (
          <AddEditLicenseModal
            open={openEditLicenseModal}
            setOpen={setOpenEditLicenseModal}
            onSubmit={onAddEditLicense}
            editingLicense={editingLicense}
          />
        )} */}
        {openEditProfile && (
          <EditUserProfileModal
            open={openEditProfile}
            setOpen={setOpenEditProfile}
            onSubmit={onUpdateProfile}
            data={{
              firstName: user?.firstName,
              lastName: user?.lastName,
            }}
          />
        )}
        {/* {openEditPassword && (
          <UpdateUserPasswordModal
            open={openEditPassword}
            setOpen={setOpenResetPassword}
            onSubmit={onUpdatePassword}
          />
        )}
        {pendingVerification && (
          <VerifyEmailAddressModal
            open={pendingVerification}
            setOpen={setPendingVerification}
            onSubmit={completeEmailAddressVerification}
          />
        )} */}
      </div>
    </SettingsSubMenu>
  );
};

export default PersonalPage;
