import Modal, { ModalProps } from "@/components/common/Modal";
import React, { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import { ChargeType } from "@prisma/client";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { OrderingAddressDetailsFormInputs } from "../forms/OrderKitsCartForm";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export type EditClinicFormInputs = {
  name: string;
};

interface Props extends Pick<ModalProps, "open" | "setOpen"> {
  organization: { name: string; emails: string[] };
  data: OrderingAddressDetailsFormInputs;
  currentAccount: GetAccountResponse;
}

const ReviewKitOrderModal = ({
  currentAccount,
  open,
  setOpen,
  data,
  organization,
}: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, setValue } = useForm<OrderingAddressDetailsFormInputs>({
    defaultValues: {
      quantity: data.quantity,
      subtotal: data.subtotal,
      total: data.total,
      additionalCharges: data.additionalCharges,
      shipTo: {
        addressLine1: data.shipTo?.addressLine1 || "",
        addressLine2: data.shipTo?.addressLine2 || "",
        city: data.shipTo?.city || "",
        state: data.shipTo?.state || "",
        zip: data.shipTo?.zip || "",
        country: data.shipTo?.country || "",
      },
    },
  });

  useEffect(() => {
    if (data) {
      setValue("quantity", data.quantity);
      setValue("subtotal", data.subtotal);
      setValue("total", data.total);
      setValue("additionalCharges", data.additionalCharges);
      setValue("shipToId", data.shipToId);
      setValue("shipTo", {
        label: data.shipTo?.label || "",
        addressLine1: data.shipTo?.addressLine1 || "",
        addressLine2: data.shipTo?.addressLine2 || "",
        city: data.shipTo?.city || "",
        state: data.shipTo?.state || "",
        zip: data.shipTo?.zip || "",
        country: data.shipTo?.country || "",
      });
    }
  }, [data, setValue]);

  const onSubmit = (data: OrderingAddressDetailsFormInputs) => {
    if (currentAccount) {
      setIsSubmitting(true);
      fetch("/api/clinical/kits/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          clinicId: currentAccount.organization.id,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            const res = await response.json();
            toast.success(res.message ?? "Kit order created successfully");
            setOpen(false);
            router.push("/clinical/kits/orders?success=true");
          } else {
            const res = await response.json();
            toast.error(
              res.error ?? "An error occurred creating the kit order"
            );
          }
        })
        .catch((error) => {
          console.error("Error creating kit order:", error);
          toast.error("An error occurred creating the kit order");
        })
        .finally(() => {
          setIsSubmitting(false); // Ensure this happens after the request completes
        });
    } else {
      toast.error("No account found to create order");
    }
  };

  return (
    <Modal
      title="Review Kit Order"
      open={open}
      setOpen={setOpen}
      onClose={() => setOpen(false)}
      size="sm"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <div className="flex flex-col gap-4">
          <h1 className="col-span-1 underline">Clinic Details</h1>
          <div className="flex flex-col pl-4 text-sm">
            <h1>{organization.name}</h1>
            <p>{organization.emails.join(", ")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="col-span-1 underline">Shipping Address</div>
            <div className="pl-4">
              <div className="col-span-2">
                {data.shipTo?.addressLine1}
                {data.shipTo?.addressLine2 && (
                  <div className="col-span-2">{data.shipTo?.addressLine2}</div>
                )}
              </div>
              <div className="col-span-2">
                {data.shipTo?.city}
                {", "}
                {data.shipTo?.state}
              </div>
              <div className="col-span-1">
                <div className="col-span-1">
                  {data.shipTo?.zip}
                  {", "}
                  {data.shipTo?.country}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 ">
            <div className="col-span-2 underline">Billing Details</div>
            <p className="col-span-2 m-2 text-sm">
              Once order is submitted, you will be billed via invoice sent to
              all the clinic email addresses.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-2">
            <div className="text-md col-span-1 mb-2 underline">
              Order Summary
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex-col-2 text-md flex justify-between">
                <h1>Quantity</h1>
                <div>{data.quantity} Kit(s)</div>
              </div>
              <hr className="border-1 border-highlight-600" />
              <div className="flex-col-2 flex justify-between text-sm">
                <div>Subtotal</div>
                <div>${data.subtotal.toFixed(2)}</div>
              </div>
              <hr className="border-1 border-highlight-600" />
              <div className="flex-col-2 flex justify-between text-sm">
                <div>Estimate Shipping</div>
                <div>
                  $
                  {data.additionalCharges
                    .find((charge) => charge.type === ChargeType.SHIPPING)
                    ?.amount.toFixed(2)}
                </div>
              </div>
              <hr className="border-1 border-highlight-600" />
              <div className="flex-col-2 flex justify-between text-sm">
                <div>Estimated Tax</div>
                <div>
                  $
                  {data.additionalCharges
                    .find((charge) => charge.type === ChargeType.TAX)
                    ?.amount.toFixed(2)}
                </div>
              </div>
              <hr className="border-1 border-highlight-600" />
              <div className="flex-col-2 flex justify-between text-lg">
                <div>Order Total</div>
                <div>${data.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Submit Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewKitOrderModal;
