import type { NextApiRequest, NextApiResponse } from "next";

import { ResetPasswordTemplate } from "@/components/email/ResetPasswordTemplate";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { sendEmail } from "@/lib/email/utils";

const SALTROUNDS = 10;
const ONE_DAY = 86400000;
const FIFTEEN_MINUTES = 900000;

export const getPasswordHash = async (password: string) => {
  return await bcrypt
    .genSalt(SALTROUNDS)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      return hash;
    })
    .catch((err) => console.error(err.message));
};

export const createToken = async (
  employeeId: string,
  set: "set" | "reset",
  isInsideRequest: boolean
) => {
  const expirationTime = set === "reset" ? FIFTEEN_MINUTES : ONE_DAY;

  const token = await prisma.passwordResetToken.create({
    data: {
      employeeId: employeeId,
      token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ""),
      expiration: new Date(Date.now() + expirationTime),
    },
  });

  const url = `${process.env.NEXT_BASE_URL}/${set}/${token.token}?isInsideRequest=${isInsideRequest}`;

  return url;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) => {
  if (req.method === "POST") {
    const { email, isInsideRequest } = req.body;

    const employeeExist = await prisma.employee.findUnique({
      where: {
        email: email,
      },
    });

    if (!employeeExist) {
      return res.status(400).json({ message: "This email is not registered" });
    }

    const url = await createToken(employeeExist.id, "reset", isInsideRequest);

    await sendEmail({
      toEmail: employeeExist.email,
      subject: `Reset password request`,
      html: ResetPasswordTemplate({
        name: employeeExist.fullName,
        url: url,
      }),
    });

    return res.status(200).json({ message: "Email sent" });
  } else if (req.method === "PATCH") {
    const { token, password, firstName, lastName } = req.body;

    const tokenExist = await prisma.passwordResetToken.findUnique({
      where: {
        token: token,
      },
    });

    if (!tokenExist) {
      return res.status(200).json({ message: "Invalid token" });
    }

    if (tokenExist?.resetAt || tokenExist?.expiration < new Date()) {
      return res.status(401).json({ message: "Token expired" });
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: tokenExist.employeeId,
      },
    });

    if (!employee) {
      return res.status(500).json({ message: "User not found" });
    }

    const passwordHash = await getPasswordHash(password);

    if (!passwordHash) {
      return res.status(500).json({ error: "Error encrypting password" });
    }

    let updatedUser = null;

    if (firstName && lastName) {
      updatedUser = prisma.employee.update({
        where: {
          id: tokenExist.employeeId,
        },
        data: {
          fullName: firstName + " " + lastName,
          password: passwordHash,
        },
      });
    } else {
      updatedUser = prisma.employee.update({
        where: {
          id: tokenExist.employeeId,
        },
        data: {
          password: passwordHash,
        },
      });
    }

    const updatedToken = prisma.passwordResetToken.update({
      where: {
        token: token,
      },
      data: {
        resetAt: new Date(),
      },
    });

    try {
      await prisma.$transaction([updatedUser, updatedToken]);
    } catch (error) {
      return res.status(500).json({
        error:
          "An unexpected error occured, please try again and if the error persist, please contact support.",
      });
    }

    return res.status(200).json({ message: "Password updated!" });
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
};

export default handler;
