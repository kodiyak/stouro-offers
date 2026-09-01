import { db } from "@/lib/clients/db";
import { AppError } from "@/lib/utils/error";
import type { TransactionInputResolver } from "./protocol";

export const customerTransactionResolver: TransactionInputResolver = async (
  props,
) => {
  const { targetId, targetType } = props;

  if (targetType !== "CUSTOMER") {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: `Invalid targetType: ${targetType}. Expected 'CUSTOMER'.`,
      details: { targetType },
    });
  }

  const customer = await db.customer.findUnique({
    where: { id: targetId },
  });

  if (!customer) {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: `Customer with ID ${targetId} not found.`,
      details: { targetId },
    });
  }
};
