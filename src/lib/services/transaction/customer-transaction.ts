import { db } from "@/lib/clients/db";
import { AppError } from "@/lib/utils/error";
import type { TransactionInputResolver } from "./protocol";

export const customerTransactionResolver: TransactionInputResolver<
  "CUSTOMER"
> = async (props) => {
  const { targetId } = props;

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

  return {
    amount: props.amount,
    description: props.description,
    metadata: props.metadata,
    targetType: "CUSTOMER",
    targetId: customer.id,
    type: props.type,
  };
};
