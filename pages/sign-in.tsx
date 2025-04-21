import Container from "@/components/layout/Container";
import { GetServerSideProps } from "next";
import SignInForm from "@/components/forms/auth/SignInForm";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth";

export interface SignInFormInputs {
  email: string;
  password: string;
}

interface Props {
  redirect?: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { route } = query;

  if (session) {
    return {
      redirect: {
        destination: route ? `/${route}` : "/",
        permanent: false,
      },
    };
  }

  const reroute = route?.toString() || "";

  return {
    props: { redirect: reroute },
  };
};

const SignInPage = ({ redirect }: Props) => {
  return (
    <Container className="flex grow">
      <SignInForm redirect={redirect} />
    </Container>
  );
};

export default SignInPage;
