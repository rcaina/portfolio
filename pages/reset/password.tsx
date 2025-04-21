import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import Container from "@/components/layout/Container";
import { ForgotPasswordForm } from "@/components/forms/auth/ForgotPasswordForm";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

type Props = Record<string, never>;

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

const ForgotPassword: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({}) => {
  const router = useRouter();

  const onSubmit = async ({ email }: { email: string }) => {
    await fetch(`/api/reset/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, isInsideRequest: false }),
    })
      .then((res) => {
        if (res.status === 200) {
          router.push("/reset/email-success");
          toast.success("Reset password email sent");
        } else {
          toast.error("Invalid email address");
        }
        return res;
      })
      .catch(() => toast.error("Invalid email address"));
  };

  return (
    <Container className="flex grow">
      <ForgotPasswordForm onSubmit={onSubmit} />
    </Container>
  );
};

export default ForgotPassword;
