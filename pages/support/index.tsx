import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { Employee } from "@prisma/client";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string().optional(),
  message: z.string().min(1),
});

type ContactInputs = {
  name: string;
  email: string;
  contactNumber: string;
  company: string;
  message: string;
};

interface Props {
  user: Employee & {
    accounts: {
      organization: {
        name: string;
      };
    }[];
  };
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
    select: {
      fullName: true,
      email: true,
      accounts: {
        select: {
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
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

const SupportPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ContactInputs>({
    defaultValues: {
      name: user.fullName ?? "",
      email: user.email ?? "",
      company: user.accounts[0].organization.name || "",
      contactNumber: "",
      message: "",
    },
    resolver: zodResolver(ContactSchema),
  });

  const onSubmit = async (data: ContactInputs) => {
    try {
      setIsLoading(true);
      await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          company: user.accounts[0].organization.name,
        }),
      }).then((res) => {
        if (res.ok) {
          reset();
          setIsLoading(false);
          toast.success("Support request sent successfully");
        } else {
          setIsLoading(false);
          toast.error("Failed to send support request");
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <PageHeader title="Portal Support & Assistance" />
      <div className="border-t border-secondary-200"></div>
      <Container className="ml-36 flex h-full flex-col gap-4 border-l border-secondary-200 !p-0">
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex w-full flex-col gap-2 border-b border-secondary-200 p-4">
            <input
              type="text"
              placeholder="Name"
              className="border-none bg-transparent focus:outline-none focus:ring-0"
              {...register("name")}
              disabled={true}
            />
          </div>
          <div className="flex w-full flex-col gap-2 border-b border-secondary-200 p-4">
            <input
              type="text"
              placeholder="Email"
              className="border-none bg-transparent focus:outline-none focus:ring-0"
              {...register("email")}
              disabled={true}
            />
          </div>
          <div className="flex w-full flex-col gap-2 border-b border-secondary-200 p-4">
            <input
              type="text"
              placeholder="Contact Number (optional)"
              className="border-none bg-transparent focus:outline-none focus:ring-0"
              {...register("contactNumber")}
            />
          </div>
          <div className="flex w-full flex-col gap-2 border-b border-secondary-200 p-4">
            <textarea
              placeholder="Message"
              className="border-none bg-transparent focus:outline-none focus:ring-0"
              {...register("message")}
            />
          </div>
          <div className="ml-4">
            <Button
              size="lg"
              type="submit"
              variant="none"
              Icon={<ArrowUpRightIcon />}
              disabled={isLoading || !isValid}
              loading={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default SupportPage;
