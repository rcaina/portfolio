import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient, Role } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import CurrentUserNewCompanyInviteTemplate from "@/components/email/CurrentUserNewCompanyInviteTemplate";
import WelcomeRegisteredUserTemplate from "@/components/email/WelcomeRegisteredUserTemplate";
import { ensureSession } from "@/components/middleware/ensureSession";
import { isEmpty } from "lodash-es";
import { sendEmail } from "@/lib/email/utils";

const practitionerSignUpSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().min(1),
});

export type PostUserParams = z.infer<typeof practitionerSignUpSchema>;

const createInvitedEmployee = async (
  userPrisma: PrismaClient,
  { organizationId, email, firstName, lastName, role }: PostUserParams
) =>
  await userPrisma.$transaction(async (tx) => {
    if (!isEmpty(firstName) && !isEmpty(lastName)) {
      const fullName = firstName + " " + lastName;

      const practitioner = await tx.employee.create({
        data: {
          email,
          fullName,
          firstName,
          lastName,
          accounts: {
            create: {
              role: role as Role,
              organization: {
                connect: {
                  id: organizationId,
                },
              },
            },
          },
        },
        include: {
          accounts: {
            where: {
              organizationId: organizationId,
            },
            include: {
              organization: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      sendEmail({
        toEmail: email,
        subject: `Welcome to Resonant!`,
        html: WelcomeRegisteredUserTemplate({
          name: `${firstName} ${lastName}`,
        }),
      });
      return practitioner;
    }
  });

export type PostUserResponse = Prisma.PromiseReturnType<
  typeof createInvitedEmployee
>;

const generateErrorMessage = (errors: ZodError) => {
  return errors.errors
    .map((err) => {
      switch (err.path[0]) {
        case "email":
          return "Email is required.";
        case "firstName":
          return "First name is required.";
        case "lastName":
          return "Last name is required.";
        case "role":
          return "Role is required.";
        default:
          return "Invalid data provided.";
      }
    })
    .join(" ");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PostUserResponse | { message: string } | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  const userPrisma = prisma.$extends(
    forUser(account.employeeId)
  ) as PrismaClient;

  if (req.method === "POST") {
    try {
      const parsedBody = practitionerSignUpSchema.parse(req.body);

      const currentUser = await userPrisma.employee.findUnique({
        where: {
          email: parsedBody.email,
        },
      });

      if (currentUser) {
        //check if user is already part of organization
        const existingUser = await userPrisma.account.findFirst({
          where: {
            organizationId: parsedBody.organizationId,
            employeeId: currentUser.id,
          },
        });

        if (existingUser) {
          return res
            .status(400)
            .json({ error: "User is already part of organization." });
        }

        const account = await userPrisma.account.create({
          data: {
            employeeId: currentUser.id,
            organizationId: parsedBody.organizationId,
            role: parsedBody.role as Role,
          },
          include: {
            organization: true,
          },
        });

        sendEmail({
          toEmail: currentUser.email,
          subject: `You Have Been Added to ${account.organization.name} in Resonant!`,
          //Need to update this email template
          html: CurrentUserNewCompanyInviteTemplate({
            name: `${currentUser.fullName}`,
            companyName: account.organization.name,
          }),
        });
        return res.json({
          message:
            "User has been f to organization. An email has been sent to the user.",
        });
      }

      const user = await createInvitedEmployee(userPrisma, parsedBody);

      if (!user) {
        return res.status(400).json({ error: "Issue creating user." });
      }

      sendEmail({
        toEmail: user.email,
        subject: `Your Have Been Added to ${user.accounts[0].organization.name} in Resonant!`,
        //TODO:Need to update this email template
        html: WelcomeRegisteredUserTemplate({
          name: `${user.fullName}`,
        }),
      });

      return res.json({
        message:
          "User has been invited to the organization. An email has been sent.",
      });
    } catch (e) {
      if (e instanceof ZodError) {
        const customErrorMessage = generateErrorMessage(e);
        return res.status(400).json({ error: customErrorMessage });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
