import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SideNav } from "./SideNav";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const hideSideBar =
    router.pathname === "/sign-in" ||
    router.pathname === "/sign-up" ||
    router.pathname === `/reset/password` ||
    router.pathname === `/reset/[token]` ||
    router.pathname === `/reset/email-success`;

  return (
    <>
      <div suppressHydrationWarning className="flex h-screen flex-col">
        {!session && <Header />}
        <div className="flex flex-1 overflow-hidden">
          {!hideSideBar && session && <SideNav />}
          <main className="flex min-w-0 flex-1 overflow-auto">{children}</main>
        </div>
        <Footer />
      </div>
    </>
  );
}
