import NextAuth, { NextAuthOptions } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";

import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { SignInEmailTemplate } from "@/components/email/SignInEmailTemplate";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

function MyPrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient["$extends"]>
): Adapter {
  const p = prisma as PrismaClient;

  return {
    ...PrismaAdapter(prisma as PrismaClient),
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.findUnique({
          where: { identifier_token },
        });
        // delete expired tokens
        await p.verificationToken.deleteMany({
          where: {
            expires: { lt: new Date() },
          },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;

        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  providers: [
    EmailProvider({
      server: `smtp://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`,
      from: process.env.SMTP_FROM,
      maxAge: 24 * 60 * 60, // 1 day
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const inDB = await prisma.employee.findFirst({
          where: {
            email: email.toLowerCase(),
            deleted: false,
          },
        });

        const transport = nodemailer.createTransport(server);

        if (inDB) {
          await transport.sendMail({
            from,
            to: email,
            subject: "Portfolio sign in",
            html: SignInEmailTemplate({
              url: url,
              verified: inDB.emailVerified ? true : false,
            }),
          });
        } else {
          throw new Error("Email not found.");
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.password && credentials?.email) {
          const employee = await prisma.employee.findFirst({
            where: {
              email: credentials?.email.toLowerCase(),
            },
            select: {
              id: true,
              email: true,
              emailVerified: true,
              password: true,
              fullName: true,
              accounts: {
                select: {
                  id: true,
                  role: true,
                  organization: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                    },
                  },
                },
                take: 1,
              },
              image: true,
              deleted: true,
            },
          });

          if (employee?.password) {
            const isMatch = await bcrypt.compare(
              credentials?.password,
              employee.password
            );

            if (isMatch) {
              const cleanUser = {
                id: employee.id,
                email: employee.email,
                name: employee.fullName,
                image: employee?.image || null,
                emailVerified: employee?.emailVerified || null,
                role: employee.accounts[0].role,
                currentAccountId: employee.accounts[0].id,
                accountType: employee.accounts[0].organization.type,
                organizationId: employee.accounts[0].organization.id,
                organization: employee.accounts[0].organization.name,
                deleted: employee.deleted,
              };

              return cleanUser;
            }
            return null;
          } else {
            return null;
          }
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MyPrismaAdapter(prisma),
  callbacks: {
    async jwt({ token }) {
      let foundUser;

      if (token) {
        foundUser = await prisma.employee.findUnique({
          where: {
            email: token.email as string,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
            emailVerified: true,
            deleted: true,
            accounts: {
              select: {
                id: true,
                role: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
              take: 1,
            },
          },
        });
      }

      if (foundUser) {
        return {
          ...token,
          id: foundUser.id,
          image: foundUser.image,
          role: foundUser.accounts[0].role,
          currentAccountId: foundUser.accounts[0].organization.id,
          organizationId: foundUser.accounts[0].organization.id,
          organization: foundUser.accounts[0].organization.name,
          emailVerified: foundUser.emailVerified,
          deleted: foundUser.deleted,
          accountType: foundUser.accounts[0].organization.type,
        };
      }

      const organization = token?.organizationId
        ? await prisma.organization.findFirst({
            where: {
              id: token.organizationId,
            },
            select: {
              name: true,
            },
          })
        : undefined;

      return { ...token, organization: organization?.name };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub || session.user.id;

        const employee = await prisma.employee.findFirst({
          where: {
            id: session.user.id,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
            emailVerified: true,
            deleted: true,
            accounts: {
              select: {
                id: true,
                role: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            },
          },
        });

        if (employee) {
          session.id = token.id;
          session.name = token.name;
          session.email = token.email;
          session.user.id = employee.id;
          session.user.role = employee.accounts[0].role;
          session.user.organizationId = employee.accounts[0].organization.id;
          session.user.currentAccountId = employee.accounts[0].id;
          session.user.emailVerified = employee.emailVerified;
          session.user.deleted = employee.deleted;
          session.user.organization = employee.accounts[0].organization.name;
          session.user.image = employee.image;
          session.user.accountType = employee.accounts[0].organization.type;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/error",
    verifyRequest: "/verify-email",
  },
};

export default NextAuth(authOptions);
