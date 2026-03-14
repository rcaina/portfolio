import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Container from "./Container";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex grow flex-col">
        <Container>{children}</Container>
      </main>
      <SideNav />
      <ThemeToggle />
    </div>
  );
}
