import { db } from "../clients/db";
import type { OrderStatus, PaymentGatewayId } from "../enums";
import { ORDER_ITEM_ORDER_BY } from "../utils";
import { AppError } from "../utils/error";
import { isCustomerEligibleForCancellation } from "./customer";
import { getActivePaymentGateway } from "./payment-gateway";
import { reconcileCustomerLedger } from "./reconciliation";
import { getTransactionInputResolver } from "./transaction-resolver";

export async function markAsCompleted({ orderId }: { orderId: string }) {
  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order not found",
      details: { orderId },
    });
  }

  if (existing.status !== "DRAFT") {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Only draft orders can be completed",
      details: { orderId, status: existing.status },
    });
  }

  const { order } = await db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      include: { items: { orderBy: ORDER_ITEM_ORDER_BY }, customer: true },
    });
    const amount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const transactionResolver = getTransactionInputResolver("CUSTOMER");
    await tx.transaction.create({
      data: await transactionResolver({
        amount,
        targetType: "CUSTOMER",
        targetId: order.customerId,
        description: `Cobrança do pedido #${order.orderNumber}`,
        type: "CHARGE",
        metadata: {
          reference: `Pedido #${order.orderNumber}`,
          orderId,
        },
      }),
    });

    // Crédito prévio do cliente pode quitar o pedido recém-concluído.
    await reconcileCustomerLedger({ customerId: order.customerId, tx });

    return { order };
  });

  return { order };
}

export interface CancelOrderRefund {
  amount: number; // centavos
}

export interface OrderCancelOptions {
  orderId: string;
  status: OrderStatus;
  amountTotal: number;
  canCancel: boolean;
  reason?: string;
  gateway: PaymentGatewayId;
  gatewayLabel: string;
  customerEligible: boolean;
  /** Valor reembolsável (só quando PAID). */
  refundableAmount: number;
  /** Valor que vira crédito do cliente se não reembolsar. */
  creditIfNoRefund: number;
}

/**
 * Detalhes para o usuário configurar o cancelamento antes de confirmar:
 * status, quanto dá pra reembolsar, gateway ativo (async) e se o cliente
 * está apto (async).
 */
export async function getCancelOptions({
  orderId,
}: {
  orderId: string;
}): Promise<OrderCancelOptions> {
  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order not found",
      details: { orderId },
    });
  }

  const gateway = await getActivePaymentGateway();
  const customerEligible = await isCustomerEligibleForCancellation({
    customerId: existing.customerId,
  });
  const isPaid = existing.status === "PAID";

  return {
    orderId: existing.id,
    status: existing.status,
    amountTotal: existing.amountTotal,
    canCancel: existing.status !== "CANCELLED",
    reason:
      existing.status === "CANCELLED" ? "Order already cancelled" : undefined,
    gateway: gateway.id,
    gatewayLabel: gateway.label,
    customerEligible,
    refundableAmount: isPaid ? existing.amountTotal : 0,
    creditIfNoRefund: isPaid ? existing.amountTotal : 0,
  };
}

/**
 * Cancela um pedido.
 *
 * - DRAFT / COMPLETED: remove a cobrança (CHARGE) do ledger se houver.
 * - PAID: remove a cobrança e, se `refund` for informado, chama o gateway
 *   ativo e lança um ADJUSTMENT positivo (anula o PAYMENT — reembolso).
 *   Sem `refund`, o PAYMENT permanece e vira crédito a favor do cliente.
 */
export async function markAsCancelled({
  orderId,
  refund,
}: {
  orderId: string;
  refund?: CancelOrderRefund;
}) {
  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order not found",
      details: { orderId },
    });
  }

  if (existing.status === "CANCELLED") {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order already cancelled",
      details: { orderId },
    });
  }

  if (refund) {
    if (existing.status !== "PAID") {
      throw new AppError({
        code: "INVALID_INPUT",
        category: "VALIDATION",
        message: "Only paid orders can be refunded",
        details: { orderId, status: existing.status },
      });
    }

    if (refund.amount <= 0 || refund.amount > existing.amountTotal) {
      throw new AppError({
        code: "INVALID_INPUT",
        category: "VALIDATION",
        message: "Refund amount must be between 1 and the order total",
        details: { orderId, amount: refund.amount },
      });
    }
  }

  // Gateway primeiro (fora da transação): se falhar, nada é alterado.
  if (refund) {
    const gateway = await getActivePaymentGateway();
    await gateway.refund({ orderId, amount: refund.amount });
  }

  const { order } = await db.$transaction(async (tx) => {
    // Pedido COMPLETED/PAID emitiu CHARGE(s). Transação é fonte da verdade e
    // nunca é deletada: em vez de remover a cobrança, criamos um REVERSAL
    // espelhando o valor exato da linha — o par CHARGE + REVERSAL soma zero
    // no saldo e o histórico fica íntegro. REVERSAL não entra no pool de
    // créditos da reconciliação (não é dinheiro).
    const charges = await tx.transaction.findMany({
      where: {
        targetType: "CUSTOMER",
        targetId: existing.customerId,
        type: "CHARGE",
        metadata: { path: ["orderId"], equals: orderId },
      },
      select: { amount: true },
    });

    if (charges.length > 0) {
      const transactionResolver = getTransactionInputResolver("CUSTOMER");
      for (const charge of charges) {
        await tx.transaction.create({
          data: await transactionResolver({
            amount: charge.amount,
            targetType: "CUSTOMER",
            targetId: existing.customerId,
            description: `Estorno do pedido #${existing.orderNumber}`,
            type: "REVERSAL",
            metadata: { orderId },
          }),
        });
      }
    }

    if (refund) {
      // ADJUSTMENT positivo anula o PAYMENT correspondente no pool de créditos
      // (a matemática da reconciliação mantém o saldo consistente).
      const transactionResolver = getTransactionInputResolver("CUSTOMER");
      await tx.transaction.create({
        data: await transactionResolver({
          amount: refund.amount,
          targetType: "CUSTOMER",
          targetId: existing.customerId,
          description: `Reembolso do pedido #${existing.orderNumber}`,
          type: "ADJUSTMENT",
          metadata: {
            reason: `Reembolso do pedido #${existing.orderNumber}`,
            orderId,
          },
        }),
      });
    }

    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: { items: { orderBy: ORDER_ITEM_ORDER_BY }, customer: true },
    });

    return { order };
  });

  return { order };
}
