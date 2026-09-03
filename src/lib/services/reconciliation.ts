import { APP_CONFIG } from "@/app.config";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "../clients/db";
import type { ReconciliationStrategy } from "../enums";

/**
 * Reconcilia a fila de cobranças (pedidos COMPLETED/PAID) de um cliente
 * contra os créditos disponíveis (transações PAYMENT e ADJUSTMENT).
 *
 * Convenção contábil (ver customer-transaction.ts): PAYMENT e ADJUSTMENT
 * gravados com sinal negativo reduzem o "a receber", então os créditos são
 * a soma invertida desses tipos.
 *
 * Regras:
 * - Só AVANÇA (COMPLETED → PAID), nunca regride.
 * - Ordem da fila pela `position` do pedido conforme a estratégia da config
 *   (FIFO = mais antigo primeiro, LIFO = mais recente primeiro).
 * - Pedidos já PAID entram na fila para "consumir" crédito na ordem correta
 *   (sem isso, um pagamento já alocado pagaria duas vezes).
 */
export async function reconcileCustomerLedger({
  customerId,
  tx = db,
}: {
  customerId: string;
  tx?: Prisma.TransactionClient;
}) {
  const strategy: ReconciliationStrategy = APP_CONFIG.reconciliation.strategy;

  const orders = await tx.order.findMany({
    where: {
      customerId,
      status: { in: ["COMPLETED", "PAID"] },
    },
    orderBy: { position: strategy === "FIFO" ? "asc" : "desc" },
    select: { id: true, amountTotal: true, status: true },
  });

  if (orders.length === 0) {
    return { paidOrderIds: [] as string[] };
  }

  const rows = await tx.transaction.findMany({
    where: {
      targetType: "CUSTOMER",
      targetId: customerId,
      type: { in: ["PAYMENT", "ADJUSTMENT"] },
    },
    select: { amount: true },
  });

  let credits = -rows.reduce((acc, row) => acc + row.amount, 0);

  const paidOrderIds: string[] = [];
  for (const order of orders) {
    if (credits >= order.amountTotal) {
      credits -= order.amountTotal;
      if (order.status === "COMPLETED") {
        paidOrderIds.push(order.id);
      }
    } else {
      break;
    }
  }

  if (paidOrderIds.length > 0) {
    await tx.order.updateMany({
      where: { id: { in: paidOrderIds } },
      data: { status: "PAID" },
    });
  }

  return { paidOrderIds };
}
