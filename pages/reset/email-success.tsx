import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { useRouter } from "next/router";

const ResetPasswordSendEmailSuccess = () => {
  const router = useRouter();
  return (
    <Container className="flex grow">
      <div className="m-auto flex flex-col items-center gap-4">
        <h1 className="text-4xl font-medium ">Password reset</h1>

        <h3 className="text-lg ">
          Email has been sent to your email address. If the email does not show
          up, check your spam folder.
        </h3>
        <Button variant="primary" onClick={() => router.push("/")}>
          Return to login
        </Button>
      </div>
    </Container>
  );
};

export default ResetPasswordSendEmailSuccess;
