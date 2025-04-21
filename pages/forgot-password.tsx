// import React, { useState } from "react";
// import type { GetServerSideProps, NextPage } from "next";
// import { useRouter } from "next/navigation";

// import Input from "@/components/common/Input";
// import Button from "@/components/common/Button";
// import { getServerSession } from "next-auth";
// import { authOptions } from "./api/auth/[...nextauth]";

// type Props = Record<string, string>;
// export const getServerSideProps: GetServerSideProps<Props> = async ({
//   req,
//   res,
//   query,
// }) => {
//   const session = await getServerSession(req, res, authOptions);
//   const { route } = query;

//   if (session) {
//     return {
//       redirect: {
//         destination: route ? `/${route}` : "/",
//         permanent: false,
//       },
//     };
//   }

//   const reroute = route?.toString() || "";

//   return {
//     props: { redirect: reroute },
//   };
// };

// const ForgotPasswordPage: NextPage = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [code, setCode] = useState("");
//   const [successfulCreation, setSuccessfulCreation] = useState(false);
//   const [secondFactor, setSecondFactor] = useState(false);
//   const [error, setError] = useState("");

//   async function create(e: React.FormEvent) {
//     e.preventDefault();
//     await signIn
//       ?.create({
//         strategy: "reset_password_email_code",
//         identifier: email,
//       })
//       .then(() => {
//         setSuccessfulCreation(true);
//         setError("");
//       })
//       .catch((err) => {
//         setError(err.errors[0].longMessage);
//       });
//   }

//   async function reset(e: React.FormEvent) {
//     e.preventDefault();
//     await signIn
//       ?.attemptFirstFactor({
//         strategy: "reset_password_email_code",
//         code,
//         password,
//       })
//       .then((result) => {
//         if (result.status === "needs_second_factor") {
//           setSecondFactor(true);
//           setError("");
//         } else if (result.status === "complete") {
//           setActive({ session: result.createdSessionId });
//           setError("");
//         }
//       })
//       .catch((err) => {
//         setError(err.errors[0].longMessage);
//       });
//   }

//   return (
//     <div
//       style={{
//         margin: "auto",
//         maxWidth: "500px",
//       }}
//     >
//       <h1 className="font-bold">Forgot Password?</h1>
//       <form
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "1em",
//         }}
//         onSubmit={!successfulCreation ? create : reset}
//       >
//         {!successfulCreation && (
//           <>
//             <label htmlFor="email">Please provide your email address</label>
//             <Input
//               type="email"
//               placeholder="e.g john@doe.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <Button onClick={create}>Send password reset code</Button>
//             {error && <p>{error}</p>}
//           </>
//         )}

//         {successfulCreation && (
//           <>
//             <label htmlFor="password">Enter your new password</label>
//             <Input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />

//             <label htmlFor="password">
//               Enter the password reset code that was sent to your email
//             </label>
//             <Input
//               type="text"
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//             />

//             <Button onClick={reset}>Reset</Button>
//             {error && <p>{error}</p>}
//           </>
//         )}

//         {secondFactor && (
//           <p>2FA is required, but this UI does not handle that</p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default ForgotPasswordPage;

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
