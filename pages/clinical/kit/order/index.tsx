import OrderKitsCartForm, {
  OrderingAddressDetailsFormInputs,
} from "@/components/forms/OrderKitsCartForm";

import { Address } from "@prisma/client";
import Container from "@/components/layout/Container";
import { GetAccountResponse } from "@/pages/api/current/account/[id]";
import { GetServerSideProps } from "next";
import PageHeader from "@/components/layout/PageHeader";
import ReviewKitOrderModal from "@/components/modals/ReviewKitOrderModal";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { organizationAllowedRoles } from "@/lib/utils";
import prisma from "@/lib/prisma";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface Props {
  addresses: Address[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user.id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const currentAccount = await prisma.account.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          addresses: true,
          billingAddresses: true,
        },
      },
    },
  });

  if (!currentAccount?.organization.id) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  if (
    !currentAccount.organization.addresses ||
    !currentAccount.organization.billingAddresses ||
    !organizationAllowedRoles.includes(currentAccount.role)
  ) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  const addresses = currentAccount.organization.addresses;

  return {
    props: {
      addresses: JSON.parse(JSON.stringify(addresses)),
    },
  };
};

const OrderKitsPage = ({ addresses }: Props) => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<OrderingAddressDetailsFormInputs | null>(
    null
  );
  const { data: currentAccount } = useSWR<GetAccountResponse>(
    session?.user.id
      ? `/api/current/account/${session.user.currentAccountId}`
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );
  const { data: isLocked = true } = useSWR<boolean>(
    `/api/current/license-status`
  );

  const onReviewOrderForm = (data: OrderingAddressDetailsFormInputs) => {
    setData(data);
    setOpen(true);
  };

  return (
    <div className="flex max-h-screen flex-col overflow-auto">
      <div className="sticky top-0 z-20">
        <PageHeader title={`Order Your Kit(s)`} />
      </div>
      {!isLocked ? (
        <Container>
          <div className="flex flex-grow items-center justify-center">
            <OrderKitsCartForm
              addresses={addresses}
              onSubmit={onReviewOrderForm}
              setData={setData}
            />
          </div>
        </Container>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <p className="font-bold ">
            No practitioners with approved credentials found.
          </p>
        </div>
      )}
      {data && currentAccount && (
        <ReviewKitOrderModal
          open={open}
          setOpen={setOpen}
          data={data}
          organization={{
            name: currentAccount.organization.name,
            emails: currentAccount.organization.billingEmails,
          }}
          currentAccount={currentAccount}
        />
      )}
    </div>
  );
};

export default OrderKitsPage;
