import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import AddEditLicenseModal, {
  AddLicenseFormInputs,
  EditLicenseFormInputs,
} from "@/components/modals/AddEditLicenseModal";
import {
  Address,
  Employee,
  License,
  OrganizationType,
  Role,
} from "@prisma/client";
import EditEmployeeModal, {
  EditEmployeeFormInputs,
} from "@/components/modals/EditEmployeeModal";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { PlusCircleIcon, UserCircleIcon } from "@heroicons/react/20/solid";
import {
  S3Bucket,
  formatPhoneNumber,
  organizationAllowedRoles,
  upload,
} from "@/lib/utils";
import { capitalize, isEmpty } from "lodash-es";

import Button from "@/components/common/Button";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import LicenseStatusBadge from "@/components/misc/badges/LicenseStatusBadge";
import { MEDIUM_DATE_FORMAT } from "@/lib/contants";
import PageHeader from "@/components/layout/PageHeader";
import SettingsSubMenu from "@/components/displays/SettingSubMenu";
import Spinner from "@/components/common/Spinner";
import assert from "assert";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dayjs from "dayjs";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  organizationId: string | undefined;
  employee: Employee & {
    licenses: License[];
    employeeClinicMembership: {
      id: string;
      accountOwner: boolean;
      role: Role;
    };
  };
  account: {
    id: string;
    accountOwner: boolean;
    role: Role;
    organization: {
      id: string;
      name: string;
      type: OrganizationType;
      addresses: Address[];
      billingAddresses: Address[];
    };
  };
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;
  assert(typeof id === "string");
  if (!session?.user.id || !id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.currentAccountId || "",
    },
    select: {
      id: true,
      accountOwner: true,
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

  if (!currentAccount) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const emp = await prisma.employee.findUnique({
    where: {
      id: id,
    },
    include: {
      licenses: {
        where: {
          deleted: false,
        },
      },
      accounts: {
        where: {
          organizationId: currentAccount.organization.id,
          employeeId: id,
        },
        select: {
          id: true,
          accountOwner: true,
          role: true,
        },
      },
    },
  });

  if (!emp) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const organizationId = currentAccount.organization.id;

  const employee = {
    ...emp,
    employeeClinicMembership: emp?.accounts[0],
    account: {
      organization: currentAccount.organization,
    },
  };

  return {
    props: {
      organizationId,
      employee: JSON.parse(JSON.stringify(employee)),
      account: JSON.parse(JSON.stringify(currentAccount)),
    },
  };
};

const EmployeePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ organizationId, employee, account }) => {
  const router = useRouter();
  const [openAddLicenseModal, setOpenAddLicenseModal] = useState(false);
  const [accordionView, setAccordionView] = useState("licenses");
  const [openEditEmployeeModal, setOpenEditEmployeeModal] = useState(false);
  const [openEditLicenseModal, setOpenEditLicenseModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | undefined>();

  const updateEmployee = async (data: EditEmployeeFormInputs) => {
    await fetch(`/api/employee/account/${employee?.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationId,
        accountOwner: data.accountOwner.toString() === "true" ? true : false,
        role: data.role,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Membership updated successfully");
          router.replace(router.asPath, undefined, {
            scroll: false,
          });
        } else {
          const res = await response.json();
          toast.error(res.error ?? "Error updating membership.");
        }
      })
      .catch((error) => console.error("Error updating membership:", error));
  };

  const onAddEditLicense = async (
    data: AddLicenseFormInputs | EditLicenseFormInputs
  ) => {
    const method = editingLicense ? "PATCH" : "POST";

    const url = editingLicense
      ? `/api/clinical/license/${editingLicense?.id}`
      : `/api/clinical/license`;

    let uploadedMedicalLicenseS3Key = undefined;

    if (
      method === "POST" ||
      (method === "PATCH" && data.medicalLicense && data.medicalLicense[0])
    ) {
      const { s3FileId: medicalLicenseS3Key } = await upload(
        data.medicalLicense[0],
        S3Bucket.MEDICAL_LICENSES
      );
      uploadedMedicalLicenseS3Key = medicalLicenseS3Key;
    }

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: employee?.id,
        medicalLicenseS3Key: uploadedMedicalLicenseS3Key,
        ...data,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success(
            `Address ${editingLicense ? "updated" : "added"} successfully`
          );
          setOpenAddLicenseModal(false);
          setOpenEditLicenseModal(false);
          setEditingLicense(undefined);
          router.replace(router.asPath, undefined, {
            scroll: false,
          });
        } else {
          const res = await response.json();
          toast.error(
            res.error ??
              `Error ${editingLicense ? "updating" : "adding"} address`
          );
        }
      })
      .catch((error) => console.error("Error updating license:", error));
  };

  return (
    <SettingsSubMenu activeSection={"team"}>
      <div className="flex w-full">
        {account ? (
          <div className="flex w-full flex-col gap-4 ">
            <div className=" h-full">
              <PageHeader title={"Employee Information"} />
              <div className="flex w-full flex-col items-start gap-4 p-8">
                <div className="flex w-full flex-col gap-6">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <UserCircleIcon className="mr-2 h-9 w-9" />
                      <h2 className="text-lg font-bold">Employee Profile</h2>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2 rounded-sm border border-highlight-600 p-8 shadow-lg shadow-highlight-600">
                    <div className="grid w-full grid-cols-2 gap-2">
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          First Name
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {employee?.firstName}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">Last Name</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {employee?.lastName}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">Email</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {employee?.email}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          Phone Number
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {employee?.phoneNumber
                            ? formatPhoneNumber(employee.phoneNumber)
                            : "N/A"}
                        </div>
                      </div>
                      {employee?.employeeClinicMembership.role ===
                        Role.PRACTITIONER && (
                        <div className="col-span-1">
                          <label className="text-md font-medium">
                            NPI Number
                          </label>
                          <div className="text-md pl-4 text-highlight-600">
                            {employee?.nationalProviderId}
                          </div>
                        </div>
                      )}
                      <div className="col-span-1">
                        <label className="text-md font-medium">Role</label>
                        <div className="text-md pl-4 text-highlight-600">
                          {capitalize(account?.role)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="text-md font-medium">
                          Account Type
                        </label>
                        <div className="text-md pl-4 text-highlight-600">
                          {account?.accountOwner ? "Account Owner" : "Member"}
                        </div>
                      </div>
                    </div>
                    {(organizationAllowedRoles.includes(account.role) ||
                      account.role === Role.ADMIN ||
                      employee.id === account.id) && (
                      <div>
                        <Button
                          onClick={() => {
                            setOpenEditEmployeeModal(true);
                          }}
                          variant="secondary"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                  <hr className="mt-4 w-full border border-primary-300" />
                  {!isEmpty(employee?.licenses) && (
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-2"
                      value="licenses"
                    >
                      <AccordionItem value={accordionView}>
                        <AccordionTrigger
                          onClick={() =>
                            setAccordionView(
                              accordionView === "licenses" ? "" : "licenses"
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
                            {employee.licenses.map((license: License) => (
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
                  )}
                  {employee?.employeeClinicMembership.role ===
                    Role.PRACTITIONER &&
                    (organizationAllowedRoles.includes(account.role) ||
                      account.role === Role.ADMIN) && (
                      <Button
                        className="self-start"
                        onClick={() => {
                          setEditingLicense(undefined);
                          setOpenAddLicenseModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        Icon={<PlusCircleIcon className="h-4 w-4" />}
                      >
                        Add License
                      </Button>
                    )}
                </div>
              </div>
            </div>
            {employee && (
              <EditEmployeeModal
                open={openEditEmployeeModal}
                setOpen={setOpenEditEmployeeModal}
                employee={employee}
                onSubmit={updateEmployee}
              />
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center">
            <Spinner className="h-14 w-14" />
            <p className="">Loading...</p>
          </div>
        )}
      </div>
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
      )}
    </SettingsSubMenu>
  );
};

export default EmployeePage;
