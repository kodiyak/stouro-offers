import { db } from "../clients/db";
import { ORDER_ITEM_ORDER_BY } from "../utils";
import { AppError } from "../utils/error";
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

export async function markAsCancelled({ orderId }: { orderId: string }) {
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

  if (existing.status === "PAID") {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Paid orders cannot be cancelled",
      details: { orderId },
    });
  }

  const { order } = await db.$transaction(async (tx) => {
    // Pedido COMPLETED emitiu CHARGE — remove a cobrança do ledger para não
    // deixar cobrança fantasma no extrato do cliente.
    if (existing.status === "COMPLETED") {
      await tx.transaction.deleteMany({
        where: {
          targetType: "CUSTOMER",
          targetId: existing.customerId,
          type: "CHARGE",
          metadata: { path: ["orderId"], equals: orderId },
        },
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
