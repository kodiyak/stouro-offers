import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { ORDER_ITEM_ORDER_BY, sumBy } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().int().min(0), // em centavos
  // Sincronização opcional do snapshot de um item do pedido (rascunho)
  orderId: z.string().optional(),
  itemId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/products/[productId]">,
) {
  const { productId } = await params;
  const body = schema.safeParse(await request.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const { name, price, orderId, itemId } = body.data;

  let item = null;
  if (orderId && itemId) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { orderBy: ORDER_ITEM_ORDER_BY } },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DRAFT") {
      return Response.json(
        { error: "Somente pedidos em rascunho podem ser editados" },
        { status: 403 },
      );
    }

    item = order.items.find((item) => item.id === itemId) ?? null;
    if (!item) {
      return Response.json(
        { error: "Item not found in order" },
        { status: 400 },
      );
    }
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { name, price },
    });

    // Atualiza o snapshot do item (nome e preço) para refletir o produto
    if (orderId && item) {
      await tx.orderItem.update({
        where: { id: item.id },
        data: { name, price },
      });

      const remaining = await tx.orderItem.findMany({
        where: { orderId },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          amountTotal: sumBy(remaining, (item) => item.price * item.quantity),
        },
      });
    }
  });

  const productUpdated = await db.product.findUnique({
    where: { id: productId },
  });

  const order = orderId
    ? await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: { orderBy: ORDER_ITEM_ORDER_BY },
          manifests: true,
          customer: true,
        },
      })
    : null;

  return Response.json({ product: productUpdated, order });
}
