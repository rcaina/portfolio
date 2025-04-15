import {
  LicenseStatus,
  PracticeType,
  PrismaClient,
  Role,
  TissueType,
} from "@prisma/client";

import assert from "assert";
import dayOfYear from "dayjs/plugin/dayOfYear";
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

dayjs.extend(dayOfYear);

const getOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds} ${faker.string.uuid()}`;
};

const prisma = new PrismaClient();

const createPractitioners = async () => {
  if (!process.env.SEED_PASSWORD) {
    throw new Error("SEED_PASSWORD is not set");
  }

  assert(
    process.env.SEED_INTERNAL_USERS,
    "Environment variable SEED_INTERNAL_USERS must be set. Ensure the variable is correctly defined in your environment file."
  );

  type internalUser = {
    email: string;
    firstName: string;
    lastName: string;
    stripeId: string;
  };

  const internalUsers: internalUser[] = [
    {
      email: "renzo@renewbt.com",
      firstName: "Renzo",
      lastName: "Caina",
      stripeId: "cus_Rz7lKzBsgTI1uU",
    },
    {
      email: "dillon@resonantdx.com",
      firstName: "Dillon",
      lastName: "Craw",
      stripeId: "cus_RzBywvnLObipuQ",
    },
    {
      email: "jared@renewbt.com",
      firstName: "Jared",
      lastName: "Renbar",
      stripeId: "cus_Rz7h44TFfinvWi",
    },
    {
      email: "brianna@renewbt.com",
      firstName: "Brianna",
      lastName: "Vance",
      stripeId: "cus_Rz7hz6zzyeAZqQ",
    },
    {
      email: "bruce@renewbt.com",
      firstName: "Bruce",
      lastName: "Hassler",
      stripeId: "cus_Rz7eLvWSWgJkNI",
    },
    {
      email: "john@renewbt.com",
      firstName: "John",
      lastName: "Doe",
      stripeId: "cus_Rz7bYfiQlGbHfe",
    },
    {
      email: "jane@renewbt.com",
      firstName: "Jane",
      lastName: "Doe",
      stripeId: "cus_RyMhMJs4kRAYmb",
    },
  ];

  const employees = await Promise.all(
    internalUsers.map((user) =>
      prisma.employee.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          phoneNumber: faker.phone.number(),
          password: process.env.SEED_PASSWORD,
          practiceType: PracticeType.MEDICAL_DOCTOR,
          nationalProviderId: faker.string.uuid(),
          accounts: {
            create: {
              role: Role.PRACTITIONER,
              accountOwner: true,
              organization: {
                create: {
                  name: faker.company.name(),
                  stripeId: user.stripeId,
                  addresses: {
                    create: {
                      label: "Main",
                      addressLine1: faker.location.streetAddress(),
                      city: faker.location.city(),
                      state: faker.location.state(),
                      zip: faker.location.zipCode(),
                      country: faker.location.country(),
                    },
                  },
                  billingAddresses: {
                    create: {
                      label: "Main",
                      addressLine1: faker.location.streetAddress(),
                      city: faker.location.city(),
                      state: faker.location.state(),
                      zip: faker.location.zipCode(),
                      country: faker.location.country(),
                    },
                  },
                  billingEmails: [user.email],
                },
              },
            },
          },
          licenses: {
            create: {
              number: faker.string.uuid(),
              status: LicenseStatus.ACTIVE,
              effectiveDate: new Date(),
              expirationDate: dayjs().add(30, "day").toDate(),
              state: faker.location.state(),
            },
          },
        },
        include: {
          accounts: {
            include: {
              organization: true,
            },
          },
          licenses: true,
        },
      })
    )
  );
  return employees;
};

const createTests = async () => {
  await prisma.serviceType.createMany({
    data: [
      {
        id: "1",
        name: "Alzheimers",
        description: "Memory test",
        price: 560,
        labTestId: "clulc543l0068rpq0347jckcu123",
      },
      {
        id: "2",
        name: "Neurological",
        description: "Brain test",
        price: 478,
        labTestId: "clulc5443009srpq0r15y0a4y123",
      },
      {
        id: "3",
        name: "Example",
        description: "Testing test",
        price: 399,
        labTestId: "clulc544c00dwrpq07kqqpnw7123",
      },
      {
        id: "4",
        name: "Testing",
        description: "Example test",
        price: 450,
        labTestId: "clulc544o00k0rpq0xxsq8daf123",
      },
      {
        id: "5",
        name: "Expensive Test",
        description: "Expensive test",
        price: 888,
        labTestId: "clulc544x00nsrpq0bb8ihdxr123",
      },
    ],
  });
};

const createProjects = async (organizationIds: string[]) =>
  await Promise.all(
    organizationIds.map(async (organizationId) =>
      prisma.projectServicePricing.create({
        data: {
          project: {
            create: {
              name: faker.lorem.sentence(),
              description: faker.lorem.paragraph(),
              leadName: faker.person.fullName(),
              organizationId,
            },
          },
          finalPrice: faker.number.int({ min: 100, max: 1000 }),
          serviceType: {
            connect: {
              id: "1",
            },
          },
        },
        select: {
          id: true,
          projectId: true,
        },
      })
    )
  );

const createOrders = async (organizationId: string, projectId: string) => {
  await prisma.order.create({
    data: {
      organizationId,
      orderId: getOrderId(),
      price: faker.number.int({ min: 100, max: 1000 }),
      total: faker.number.int({ min: 100, max: 1000 }),
      serviceRequests: {
        create: {
          project: {
            connect: {
              id: projectId,
            },
          },
          price: faker.number.int({ min: 100, max: 1000 }),
          serviceType: {
            connect: {
              id: "1",
            },
          },
          specimen: {
            create: {
              kitId: faker.string.uuid(),
              tissueType: TissueType.WHOLE_BLOOD,
              volume: faker.number.int({ min: 10, max: 100 }),
            },
          },
        },
      },
    },
  });

  await prisma.order.create({
    data: {
      organizationId,
      orderId: getOrderId(),
      price: faker.number.int({ min: 100, max: 1000 }),
      total: faker.number.int({ min: 100, max: 1000 }),
      serviceRequests: {
        create: {
          project: {
            connect: {
              id: projectId,
            },
          },
          price: faker.number.int({ min: 100, max: 1000 }),
          serviceType: {
            connect: {
              id: "2",
            },
          },
          specimen: {
            create: {
              kitId: faker.string.uuid(),
              tissueType: TissueType.PLASMA,
              volume: faker.number.int({ min: 10, max: 100 }),
            },
          },
        },
      },
    },
  });
};

async function main() {
  const employees = await createPractitioners();
  await createTests();
  const organizationIds = employees.map(
    (employee) => employee.accounts[0].organizationId
  );
  const projectServicePricing = await createProjects(organizationIds);
  const projectIds = projectServicePricing.map((project) => project.projectId);
  await Promise.all(
    organizationIds.map(async (organizationId, index) =>
      createOrders(organizationId, projectIds[index])
    )
  );
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
