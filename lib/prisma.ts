import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export const forUser = (userId?: string, retoolEmail?: string) => {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, model, args, query }) {
            if (model === "AuditLog") {
              return query(args);
            }

            const start = performance.now();
            const originalData =
              operation === "update"
                ? await // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (prisma[model as keyof typeof prisma] as any).findUnique({
                    where: args.where,
                  })
                : null;
            const result = await query(args);
            const end = performance.now();

            await prisma.auditLog.create({
              data: {
                userId: userId,
                retoolUserEmail: retoolEmail,
                operation: operation,
                model: model ?? "UNKNOWN",
                originalEvent: originalData
                  ? JSON.stringify(originalData)
                  : undefined,
                eventChanges:
                  (operation === "update" || operation === "create") &&
                  JSON.stringify(result),
                duration: end - start,
              },
            });

            return result;
          },
        },
      },
    })
  );
};

export default prisma;
