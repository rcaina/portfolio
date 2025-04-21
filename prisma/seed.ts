import { PrismaClient } from "@prisma/client";

import assert from "assert";
import dayOfYear from "dayjs/plugin/dayOfYear";
import dayjs from "dayjs";

assert(process.env.SEED_FIRSTNAME, "Missing Seed First Name");
assert(process.env.SEED_LASTNAME, "Missing Seed Last Name");
assert(process.env.SEED_EMAIL, "Missing Seed Email");

dayjs.extend(dayOfYear);

const prisma = new PrismaClient();

const createAccount = async () => {
  if (
    !process.env.SEED_FIRSTNAME ||
    !process.env.SEED_LASTNAME ||
    !process.env.SEED_EMAIL
  ) {
    throw new Error("SEED_FIRSTNAME is not set");
  }

  await prisma.account.create({
    data: {
      firstname: process.env.SEED_FIRSTNAME,
      lastName: process.env.SEED_LASTNAME,
      email: process.env.SEED_EMAIL,
      password: "password",
    },
  });
};
async function main() {
  await createAccount();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
