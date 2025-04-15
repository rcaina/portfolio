import Link from "next/link";

import Container from "@/components/layout/Container";

export default function AuthFooter() {
  return (
    <footer className="relative z-10 border-t-[1px] border-highlight-600 text-right text-secondary-300">
      <Container>
        <p>
          © 2024&nbsp;
          <Link href="/" className="font-medium text-secondary-600">
            Resonant
          </Link>
          . All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
