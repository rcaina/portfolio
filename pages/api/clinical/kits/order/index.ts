import { ChargeTypeEnum, generateErrorMessage } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { ZodError, z } from "zod";
import prisma, { forUser } from "@/lib/prisma";

import Stripe from "stripe";
import { ensureSession } from "@/components/middleware/ensureSession";

if (!process.env.STRIPE_PRIVATE_KEY) {
  throw new Error("Missing STRIPE_PRIVATE_KEY env var");
}

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const createKitOrderSchema = z.object({
  organizationId: z.string().min(1),
  quantity: z.number().positive(),
  subtotal: z.number().positive(),
  priceAdjustments: z.array(
    z.object({
      description: z.string().min(1),
      type: ChargeTypeEnum,
      amount: z.number().positive(),
    })
  ),
  total: z.number().positive(),
  shipToId: z.string().optional(),
  shipTo: z
    .object({
      label: z.string().min(1),
      addressLine1: z.string().min(1),
      addressLine2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
});

export type PostKitOrderParams = z.infer<typeof createKitOrderSchema>;
export type GetKitOrdersParams = {
  organizationId?: string;
  filters?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
};

const getKitOrders = async (
  userPrisma: PrismaClient,
  { organizationId, page, pageSize }: GetKitOrdersParams
) => {
  const skip = (page || 0) * (pageSize || 10);
  const take = pageSize || 10;

  const where: Prisma.KitOrderWhereInput = {
    organizationId,
    deleted: false,
  };

  const kitOrders = await userPrisma.kitOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      invoice: {
        select: {
          id: true,
          stripeUrl: true,
          status: true,
        },
      },
    },
  });

  const totalKitOrders = await userPrisma.kitOrder.count({
    where,
  });

  return { kitOrders, totalKitOrders };
};

const createKitOrder = async (
  userPrisma: PrismaClient,
  {
    organizationId,
    quantity,
    subtotal,
    priceAdjustments,
    total,
    shipToId,
    shipTo,
  }: PostKitOrderParams
) => {
  return await userPrisma.$transaction(async (tx) => {
    try {
      let shipppingAddressId = shipToId;

      if (!shipppingAddressId && shipTo) {
        const address = await tx.address.create({
          data: {
            label: shipTo.label,
            addressLine1: shipTo.addressLine1,
            addressLine2: shipTo.addressLine2,
            city: shipTo.city,
            state: shipTo.state,
            zip: shipTo.zip,
            country: shipTo.country,
          },
        });
        shipppingAddressId = address.id;
      }
      if (!shipppingAddressId) {
        throw new Error("Shipping address is required.");
      }

      const kitOrder = await tx.kitOrder.create({
        data: {
          organizationId,
          quantity: quantity,
          subtotal: subtotal,
          total: total,
          priceAdjustments: {
            create: priceAdjustments,
          },
          invoice: {
            create: {
              amount: total,
            },
          },
          shipToId: shipppingAddressId,
        },
        include: {
          priceAdjustments: true,
          organization: {
            select: {
              stripeId: true,
            },
          },
        },
      });

      const invoice = await stripe.invoices.create({
        auto_advance: true,
        customer: kitOrder.organization.stripeId ?? undefined,
        collection_method: "send_invoice",
        days_until_due: 30,
        metadata: {
          kitOrderId: kitOrder.id,
        },
      });

      if (!process.env.STRIPE_KIT_PRODUCT_ID) {
        throw new Error("Missing STRIPE_KIT_PRODUCT_ID env var");
      }

      await stripe.invoiceItems.create({
        customer:
          kitOrder.organization.stripeId ?? (invoice.customer as string),
        invoice: invoice.id,
        quantity: kitOrder.quantity,
        price: process.env.STRIPE_KIT_PRICE_ID,
      });

      const priceAdjustmentsPromises = priceAdjustments.map((charge) =>
        stripe.invoiceItems.create({
          customer:
            kitOrder.organization.stripeId ?? (invoice.customer as string),
          invoice: invoice.id,
          amount: charge.amount * 100,
          description: charge.type,
        })
      );

      await Promise.all(priceAdjustmentsPromises);

      return kitOrder;
    } catch (error) {
      console.error("Error creating kit order:", error);
      throw error;
    }
  });
};

export type GetKitOrdersResponse = Prisma.PromiseReturnType<
  typeof getKitOrders
>;

export type CreateKitOrderResponse = Prisma.PromiseReturnType<
  typeof createKitOrder
>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetKitOrdersResponse | CreateKitOrderResponse | { error: string }
  >
) {
  const { account } = await ensureSession(req, res);

  try {
    const userPrisma = prisma.$extends(
      forUser(account.employeeId)
    ) as PrismaClient;

    if (req.method === "GET") {
      const { filters, organizationId }: GetKitOrdersParams = req.query;

      const pageSize =
        typeof req.query.pageSize === "string"
          ? parseInt(req.query.pageSize)
          : 10;
      const page =
        typeof req.query.page === "string" ? parseInt(req.query.page) : 0;

      const kitOrders = await getKitOrders(userPrisma, {
        filters,
        page,
        pageSize,
        organizationId,
      });

      return res.json(kitOrders);
    } else if (req.method === "POST") {
      const parsedBody = createKitOrderSchema.parse(req.body);
      const kitOrder = await createKitOrder(userPrisma, parsedBody);

      return res.json(kitOrder);
    } else {
      res.status(405).json({
        error: `The HTTP ${req.method} method is not supported at this route.`,
      });
    }
  } catch (e) {
    if (e instanceof ZodError) {
      const customErrorMessage = generateErrorMessage(e);
      return res.status(400).json({ error: customErrorMessage });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
