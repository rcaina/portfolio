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
        role: string;
      };
    };
  }
}
