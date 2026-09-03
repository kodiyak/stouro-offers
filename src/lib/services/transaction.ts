import { db } from "../clients/db";
import type { CreateTransactionProps } from "../utils/validations/transaction";
import { reconcileCustomerLedger } from "./reconciliation";
import { getTransactionInputResolver } from "./transaction-resolver";

/**
 * Cria uma transação no ledger de um alvo (hoje, sempre um cliente).
 *
 * Fluxo:
 * 1. O resolver do `targetType` valida o alvo e normaliza o input
 *    (ex.: aplica o sinal contábil de PAYMENT/CHARGE).
 * 2. Persiste a transação e reconcilia a fila de cobranças do cliente
 *    no mesmo `$transaction` (idempotente, só avança COMPLETED → PAID).
 */
export async function createTransaction(data: CreateTransactionProps) {
  const transactionInputResolver = getTransactionInputResolver(data.targetType);
  const input = await transactionInputResolver(data);

  const { transaction } = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({ data: input });

    await reconcileCustomerLedger({ customerId: input.targetId, tx });

    return { transaction };
  });

  return { transaction };
}
