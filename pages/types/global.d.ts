import { Role } from "@prisma/client";

export {};

declare global {
  interface CustomJwtSessionClaims {
    user: {
      id: string;
      email: string;
      publicMetadata: {
        onboarding: boolean;
      };
      unsafeMetadata: {
        role: Role;
      };
    };
  }
}
