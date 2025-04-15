import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import AddEditAddressModal, {
  AddEditAddressFormInputs,
} from "@/components/modals/AddEditAddressModal";
import { Address, Organization } from "@prisma/client";
import EditClinicModal, {
  EditClinicFormInputs,
} from "@/components/modals/EditClinicModal";

import Button from "@/components/common/Button";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import SettingsSubMenu from "@/components/displays/SettingSubMenu";
import Spinner from "@/components/common/Spinner";
import { SubmitHandler } from "react-hook-form";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { capitalize } from "lodash-es";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  account: {
    organization: Organization & {
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
      organization: {
        select: {
          id: true,
          name: true,
          addresses: true,
          billingAddresses: true,
        },
      },
    },
  });

  return {
    props: {
      account: JSON.parse(JSON.stringify(account)),
    },
  };
};

const ClinicPage = ({ account }: Props) => {
  const { data: session } = useSession();
  const [accordionView, setAccordionView] = useState("");
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [isShippingAddress, setIsShippingAddress] = useState(false);
  const [openEditClinic, setOpenEditClinic] = useState(false);
  const [openAddAddressModal, setOpenAddAddress] = useState(false);
  const [openEditAddressModal, setOpenEditAddress] = useState(false);

  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const defaultShippingAddress = account?.organization.addresses.find(
    (address) => address.default
  );

  const defaultBillingAddress = account?.organization.billingAddresses.find(
    (billingAddress) => billingAddress.default
  );

  const handleUpdateClinic: SubmitHandler<EditClinicFormInputs> = async (
    data
  ) => {
    await fetch("/api/clinic", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: account?.organization.id,
        ...data,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Clinic updated successfully");
          setOpenEditClinic(false);
        } else {
          const res = await response.json();
          toast.error(res.error ?? "Error updating clinic");
        }
      })
      .catch((error) => {
        console.error("Error updating clinic:", error);
        toast.error("An error occurred updating the clinic");
      });
  };

  const handleAddEditAddress: SubmitHandler<AddEditAddressFormInputs> = async (
    data
  ) => {
    const method = editingAddress ? "PUT" : "POST";
    const url = editingAddress
      ? `/api/address/${editingAddress.id}`
      : "/api/address";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isBilling: isShippingAddress,
        accountId: session?.user.id,
        clinicId: account?.organization.id,
        ...data,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success(
            `Address ${editingAddress ? "updated" : "added"} successfully`
          );
          setOpenAddAddress(false);
          setOpenEditAddress(false);
          setEditingAddress(undefined);
        } else {
          const res = await response.json();
          toast.error(
            res.error ??
              `Error ${editingAddress ? "updating" : "adding"} address`
          );
        }
      })
      .catch((error) => {
        console.error("Error adding/editing address:", error);
        toast.error(
          `An error occurred ${
            editingAddress ? "updating" : "adding"
          } the address`
        );
      });
  };

  const handleMarkAsDefault = async (address: {
    currentDefaultId?: string;
    id: string;
    isBilling?: boolean;
  }) => {
    if (address.currentDefaultId) {
      await fetch(`/api/address/set-default/${address.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentDefaultId: address.currentDefaultId,
          isBilling: address.isBilling,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            toast.success(`Address updated successfully`);
          } else {
            const res = await response.json();
            toast.error(res.error ?? `Error updating address`);
          }
        })
        .catch((error) => {
          console.error("Error marking address as default:", error);
          toast.error(`An error occurred updating the addressm as default`);
        });
    }
  };

  return (
    <SettingsSubMenu activeSection={"organization"}>
      <div className="max-h-screen overflow-auto">
        {account ? (
          <div className="flex w-full flex-col ">
            <div className="h-full">
              <div className="sticky top-0 z-20">
                <PageHeader title="Organization" showLock={isLocked} />
              </div>
              <div className="flex h-5/6 flex-col items-start gap-4 overflow-y-auto p-8">
                <h2 className="text-lg font-bold ">Organization Details</h2>
                <div className="flex w-full flex-row justify-between rounded-sm border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
                  <div className="pl-2">
                    <label className="font-bold">Name</label>
                    <h1 className="pl-4 text-xl text-highlight-600">
                      {account?.organization.name || "Resonant Clinic"}
                    </h1>
                  </div>
                  <div className="">
                    <Button
                      onClick={() => {
                        setOpenEditClinic(true);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <hr className="border-1 mt-4 w-full border-highlight-600" />
                {defaultShippingAddress && (
                  <div className="flex w-full flex-col gap-5">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-lg font-bold ">Shipping Address</h2>
                    </div>
                    <div className="flex-col-2 flex w-full items-center rounded-sm border border-highlight-600 p-6 pb-4 pt-2 shadow-lg shadow-highlight-600">
                      <div className="grid w-full grid-cols-1 gap-2">
                        <div className="col-span-2 font-bold">
                          {defaultShippingAddress.label}
                        </div>
                        <div className="col-span-1">
                          {defaultShippingAddress.addressLine1}{" "}
                          {defaultShippingAddress.addressLine2 &&
                            defaultShippingAddress.addressLine2 + " "}
                          {defaultShippingAddress.city}
                          {", "}
                          {defaultShippingAddress.state}
                          {", "}
                          {defaultShippingAddress.zip}
                          {", "}
                          {defaultShippingAddress.country}
                        </div>
                      </div>
                      <div>
                        <Button
                          onClick={() => {
                            setEditingAddress(defaultShippingAddress);
                            setIsShippingAddress(true);
                            setOpenEditAddress(true);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {account?.organization &&
                  account?.organization.addresses.length > 1 && (
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-2"
                      value="shipping"
                      onClick={() =>
                        setAccordionView(
                          !accordionView
                            ? "shipping"
                            : accordionView === "shipping"
                            ? ""
                            : "shipping"
                        )
                      }
                    >
                      <AccordionItem value={accordionView}>
                        <AccordionTrigger>
                          <div className="flex">
                            <h2 className="text-lg ">More...</h2>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="overflow-visible">
                          <div className="grid grid-cols-2 gap-4">
                            {account?.organization.addresses
                              .filter((address: Address) => !address.default)
                              .map((address: Address) => (
                                <div
                                  className="flex w-full flex-col rounded-sm border border-highlight-600 p-6 pb-4 pt-2 shadow-lg shadow-highlight-600"
                                  key={address.id}
                                >
                                  <div className="flex h-full w-full items-center justify-between">
                                    <div className="font-bold">
                                      {capitalize(address.label)}
                                    </div>
                                    <div>
                                      <Button
                                        onClick={() => {
                                          handleMarkAsDefault({
                                            currentDefaultId:
                                              defaultShippingAddress?.id,
                                            id: address.id,
                                            isBilling: false,
                                          });
                                        }}
                                        variant="underline"
                                        size="xs"
                                      >
                                        Mark As Default
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingAddress(address);
                                          setIsShippingAddress(true);
                                          setOpenEditAddress(true);
                                        }}
                                        variant="underline"
                                        size="xs"
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingAddress(address);
                                          setIsShippingAddress(true);
                                          setOpenEditAddress(true);
                                        }}
                                        variant="dangerLine"
                                        size="xxs"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex w-full justify-between gap-2">
                                    <div className="col-span-2">
                                      {address.addressLine1}{" "}
                                      {address.addressLine2 &&
                                        address.addressLine2 + " "}
                                      {address.city} {address.state}
                                      {", "}
                                      {address.zip} {address.country}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                <div className="mb-4 mt-4">
                  <Button
                    className="self-start"
                    onClick={() => {
                      setIsShippingAddress(true);
                      setOpenAddAddress(true);
                    }}
                    variant="outline"
                    size="sm"
                    Icon={<PlusCircleIcon className="h-4 w-4" />}
                  >
                    Add Shipping Address
                  </Button>
                </div>
                <hr className="border-1 w-full border-highlight-600" />
                {defaultBillingAddress && (
                  <div className="flex w-full flex-col gap-5">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-lg font-bold ">Billing Address</h2>
                    </div>
                    <div className="flex-col-2 flex w-full items-center rounded-sm border border-highlight-600 p-6 pb-4 pt-2 shadow-lg shadow-highlight-600">
                      <div className="grid w-full grid-cols-1 gap-2">
                        <div className="col-span-2 font-bold">
                          {defaultBillingAddress.label}
                        </div>
                        <div className="col-span-2">
                          {defaultBillingAddress.addressLine1}{" "}
                          {defaultBillingAddress.addressLine2 &&
                            defaultBillingAddress.addressLine2 + " "}
                          {defaultBillingAddress.city}
                          {", "}
                          {defaultBillingAddress.state}
                          {", "}
                          {defaultBillingAddress.zip}
                          {", "}
                          {defaultBillingAddress.country}
                        </div>
                      </div>
                      <div>
                        <Button
                          onClick={() => {
                            setEditingAddress(defaultBillingAddress);
                            setIsShippingAddress(false);
                            setOpenEditAddress(true);
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {account?.organization &&
                  account?.organization.billingAddresses.length > 1 && (
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-2"
                      value="billing"
                      onClick={() =>
                        setAccordionView(
                          !accordionView
                            ? "billing"
                            : accordionView === "billing"
                            ? ""
                            : "billing"
                        )
                      }
                    >
                      <AccordionItem value={accordionView}>
                        <AccordionTrigger>
                          <div className="flex justify-between">
                            <h2 className="text-lg">More...</h2>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="overflow-visible">
                          <div className="grid grid-cols-2 gap-4">
                            {account?.organization.billingAddresses
                              .filter(
                                (billingAddress: Address) =>
                                  !billingAddress.default
                              )
                              .map((billingAddress: Address) => (
                                <div
                                  className="flex w-full flex-col rounded-sm border border-highlight-600 p-6 pb-4 pt-2 shadow-lg shadow-highlight-600"
                                  key={billingAddress.id}
                                >
                                  <div className="flex h-full w-full items-center justify-between">
                                    <div className="col-span-2 font-bold">
                                      {capitalize(billingAddress.label)}
                                    </div>
                                    <div>
                                      <Button
                                        onClick={() => {
                                          handleMarkAsDefault({
                                            currentDefaultId:
                                              defaultBillingAddress?.id,
                                            id: billingAddress.id,
                                            isBilling: true,
                                          });
                                        }}
                                        variant="underline"
                                        size="xs"
                                      >
                                        Mark As Default
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setEditingAddress(billingAddress);
                                          setIsShippingAddress(false);
                                          setOpenEditAddress(true);
                                        }}
                                        variant="underline"
                                        size="xs"
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="grid w-full grid-cols-2 gap-2">
                                    <div className="col-span-2">
                                      {billingAddress.addressLine1}{" "}
                                      {billingAddress.addressLine2 &&
                                        billingAddress.addressLine2 + " "}
                                      {billingAddress.city},{" "}
                                      {billingAddress.state},{" "}
                                      {billingAddress.zip},{" "}
                                      {billingAddress.country}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                <div>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setIsShippingAddress(false);
                      setOpenAddAddress(true);
                    }}
                    variant="outline"
                    size="sm"
                    Icon={<PlusCircleIcon className="h-4 w-4" />}
                  >
                    Add Billing Address
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center">
            <Spinner className="h-14 w-14" />
            <p className="">Loading...</p>
          </div>
        )}
        {openEditClinic && account?.organization && (
          <EditClinicModal
            open={openEditClinic}
            setOpen={setOpenEditClinic}
            onSubmit={handleUpdateClinic}
            clinic={account.organization}
          />
        )}
        {openAddAddressModal && (
          <AddEditAddressModal
            open={openAddAddressModal}
            setOpen={setOpenAddAddress}
            onSubmit={handleAddEditAddress}
            isBilling={isShippingAddress}
          />
        )}
        {openEditAddressModal && editingAddress && (
          <AddEditAddressModal
            open={openEditAddressModal}
            setOpen={setOpenEditAddress}
            onSubmit={handleAddEditAddress}
            isBilling={isShippingAddress}
            editingAddress={editingAddress}
            setEditingAddress={setEditingAddress}
          />
        )}
      </div>
    </SettingsSubMenu>
  );
};

export default ClinicPage;
