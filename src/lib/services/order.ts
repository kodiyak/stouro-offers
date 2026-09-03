import { db } from "../clients/db";
import { ORDER_ITEM_ORDER_BY } from "../utils";
import { AppError } from "../utils/error";
import { getTransactionInputResolver } from "./transaction";

export async function markOrderAsPaid({ orderId }: { orderId: string }) {
  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order not found",
      details: { orderId },
    });
  }

  if (existing.status === "PAID") {
    throw new AppError({
      code: "INVALID_INPUT",
      category: "VALIDATION",
      message: "Order already paid",
      details: { orderId },
    });
  }

  const { order } = await db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
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
        description: `Payment for order ${orderId}`,
        type: "CHARGE",
        metadata: {
          reference: `Pedido #${order.orderNumber}`,
        },
      }),
    });

    return { order };
  });

  return { order };
}
