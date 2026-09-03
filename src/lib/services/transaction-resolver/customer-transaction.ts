import { db } from "@/lib/clients/db";
import { AppError } from "@/lib/utils/error";
import type { TransactionInputResolver } from "./protocol";

/**
 * Convenção contábil do ledger (balance = "a receber" do cliente):
 * - CHARGE     → amount positivo  (cobrança emitida: o cliente deve mais)
 * - PAYMENT    → amount negativo  (pagamento recebido: o cliente deve menos)
 * - ADJUSTMENT → sinal livre      (desconto −, taxa/juros +)
 * - REVERSAL   → amount negativo  (estorno de cobrança: desfaz o CHARGE)
 *
 * O payload (schema) recebe valores em módulo; este resolver aplica o sinal.
 */
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

  const amount =
    props.type === "PAYMENT" || props.type === "REVERSAL"
      ? -Math.abs(props.amount)
      : props.amount;

  return {
    amount,
    description: props.description,
    metadata: props.metadata,
    targetType: "CUSTOMER",
    targetId: customer.id,
    type: props.type,
  };
};
