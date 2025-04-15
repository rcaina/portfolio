import { GetServerSideProps } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type Props = Record<string, unknown>;

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

  return {
    props: {},
  };
};

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex w-full flex-col">
      <PageHeader title={`Welcome, ${session?.user.name}`} />
      <div className="h-2/3 rounded-md p-8">
        <div className="flex h-5/6 flex-col items-center gap-4">
          <div className="shadow-b flex h-1/2 w-full flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
            <div className="rounded-mdp-4 flex w-full flex-col items-center">
              <h2 className="text-lg ">Billing Manager</h2>
              <p>
                {
                  "[Tell the patient what we do.] Tell us what you are interested in!"
                }
              </p>
              <p>Let us know what you are looking for</p>
              <p>Let us know what you are looking for</p>
              <p>Let us know what you are looking for</p>
            </div>
          </div>
        </div>
      </div>
      <div className=" h-1/3 rounded-md p-8">
        <h2 className="ml-4 mt-4 flex text-xl ">Quick Links</h2>
        <div className="flex w-full flex-col items-center justify-center gap-12 pt-4">
          <div className="grid min-h-32 w-full grid-cols-1 gap-4 md:grid-cols-3">
            <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
              <h3 className="text-xl ">Invoices</h3>
              <p>{"View All Invoices"}</p>
              <div
                className=" text-highlight-600"
                onClick={() => router.push("/billing/invoices/services")}
              >
                Go To Page
              </div>
            </div>

            <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
              <h3 className="text-xl ">Reports</h3>
              <p>{"Payment Summary"}</p>
              <div
                className=" text-highlight-600"
                onClick={() => router.push("/billing/invoices/services")}
              >
                View
              </div>
            </div>

            <div className="shadow-b flex flex-col items-center justify-center rounded-md border border-highlight-600 p-4 shadow-lg shadow-highlight-600">
              <h3 className="text-xl ">Landing Page</h3>
              <p>{"Our Home Site"}</p>
              <Link
                className=" text-highlight-600"
                href="https://www.resonantdx.com/"
                target="_blank"
              >
                Go to Lab Reference
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
