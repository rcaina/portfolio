import assert from "assert";
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import prisma, { forUser } from "@/lib/prisma";
import { InvoiceStatus, PrismaClient } from "@prisma/client";

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY env var");
}
if (!process.env.STRIPE_WEBHOOK_ENDPOINT_KEY) {
  throw new Error("Missing STRIPE_WEBHOOK_ENDPOINT_KEY env var");
}

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: string } | { message: string }>
) {
  if (req.method === "POST") {
    let event: Stripe.Event;

    try {
      const buf = await buffer(req);
      const sig = req.headers["stripe-signature"];
      assert(typeof sig === "string", "stripe-signature header is missing");

      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error validating Stripe webhook signature", err);
      return res.status(400).send({ error: `Webhook Error: ${err.message}` });
    }

    try {
      const invoice = event.data.object as Stripe.Invoice;

      if (!invoice.metadata?.kitOrderId && !invoice.metadata?.serviceOrderId) {
        throw new Error("No metadata id found in invoice metadata");
      }

      const stripePrisma = prisma.$extends(forUser("stripe")) as PrismaClient;

      if (invoice.metadata?.kitOrderId) {
        switch (event.type) {
          case "invoice.sent":
            await stripePrisma.kitOrder.update({
              where: { id: invoice.metadata.kitOrderId },
              data: {
                invoice: {
                  update: {
                    invoiceNumber: invoice.number,
                    status: InvoiceStatus.BILLED,
                    stripeUrl: invoice.invoice_pdf,
                    paymentLink: invoice.hosted_invoice_url,
                    dueAt: invoice.due_date
                      ? new Date(invoice.due_date * 1000)
                      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  },
                },
              },
            });

            return res
              .status(200)
              .json({ message: "Kit order payment status updated to billed" });
            break;
          case "invoice.payment_failed":
            await stripePrisma.kitOrder.update({
              where: { id: invoice.metadata.kitOrderId },
              data: {
                invoice: {
                  update: {
                    status: InvoiceStatus.PAYMENT_FAILED,
                  },
                },
              },
            });

            return res
              .status(200)
              .json({ message: "Kit order payment status updated to failed" });
            break;
          case "invoice.payment_succeeded":
            await stripePrisma.kitOrder.update({
              where: { id: invoice.metadata.kitOrderId },
              data: {
                invoice: {
                  update: {
                    status: InvoiceStatus.PAID_IN_FULL,
                  },
                },
              },
            });

            return res.status(200).json({
              message: "Kit order payment status updated to paid in full",
            });
          case "invoice.voided":
            await stripePrisma.kitOrder.update({
              where: { id: invoice.metadata.kitOrderId },
              data: {
                invoice: {
                  update: {
                    status: InvoiceStatus.VOID,
                  },
                },
              },
            });

            return res
              .status(200)
              .json({ message: "Kit order payment status updated to void" });
          case "invoice.updated":
            return res
              .status(200)
              .json({ message: "Kit order payment status updated" });
            break;
          default:
            console.warn(`Unhandled event type ${event.type}`);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error handling Stripe event", err);
      return res
        .status(500)
        .send({ error: `Webhook handler failed: ${err.message}` });
    }

    res.json({ message: "Event received" });
  } else {
    res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`,
    });
  }
}
