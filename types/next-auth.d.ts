declare module "next-auth" {
  interface User {
    id: string;
    emailVerified: boolean | null;
    deleted: boolean;
  }

  interface Session {
    user: User;
  }
}
