import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  ResetPasswordForm,
  ResetPasswordFormInputs,
} from "@/components/forms/auth/ResetPasswordForm";

import Container from "@/components/layout/Container";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { isEmpty } from "lodash-es";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ONE_DAY = 86400000;
interface Props {
  token: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { token, isInsideRequest } = query;
  const isInsideRequestFlag = isInsideRequest === "true";

  const tokenString = typeof token === "string" ? token : "";

  const foundToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: tokenString,
    },
  });

  await prisma.passwordResetToken.deleteMany({
    where: {
      expiration: {
        lt: new Date(Date.now() - ONE_DAY),
      },
    },
  });

  if (!foundToken) {
    return {
      redirect: {
        destination: "/404.tsx",
        permanent: false,
      },
    };
  }

  if (foundToken.expiration < new Date() || foundToken.resetAt) {
    return {
      redirect: {
        destination: "/reset-password/expired-token",
        permanent: false,
      },
    };
  }

  if (!isEmpty(session) && !isInsideRequestFlag) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { token: tokenString },
  };
};

const ResetTokenPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ token }) => {
  const router = useRouter();

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    await fetch(`/api/reset/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password: data.password }),
    })
      .then(async (res) => {
        const response = await res.json();

        if (res.ok) {
          toast.success("Password reset successfully");
          router.push("/sign-in");
        } else {
          toast.error(
            response.message || "An error occurred. Please try again."
          );
        }
      })
      .catch((error) => toast.error(error.message));
  };

  return (
    <Container className="flex grow">
      <ResetPasswordForm onSubmit={onSubmit} />
    </Container>
  );
};

export default ResetTokenPage;
