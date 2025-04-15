import AuthFooter from "./AuthFooter";
import AuthHeader from "./AuthHeader";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="bg-primary-50 flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex grow items-center">{children}</main>
      <AuthFooter />
    </div>
  );
}
