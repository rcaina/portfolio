import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: string;
    role: Role;
    organizationId: string | null;
    currentAccountId: string | null;
    emailVerified: Date | null;
    accountType: AccountType;
    deleted: boolean;
    organization: string | null;
    image: string | null;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: User & DefaultUser;
  }
}
