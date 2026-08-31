import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { ORDER_ITEM_ORDER_BY, sumBy } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0), // em centavos
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/items/[itemId]">,
) {
  const { orderId, itemId } = await params;
  const body = schema.safeParse(await request.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

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

  if (!order.items.some((item) => item.id === itemId)) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  const { name, quantity, price } = body.data;

  await db.$transaction(async (tx) => {
    await tx.orderItem.update({
      where: { id: itemId },
      data: { name, quantity, price },
    });

    const remaining = await tx.orderItem.findMany({ where: { orderId } });

    await tx.order.update({
      where: { id: orderId },
      data: {
        amountTotal: sumBy(remaining, (item) => item.price * item.quantity),
      },
    });
  });

  const orderUpdated = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: ORDER_ITEM_ORDER_BY },
      manifests: true,
      customer: true,
    },
  });

  return Response.json({ order: orderUpdated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/items/[itemId]">,
) {
  const { orderId, itemId } = await params;

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

  if (!order.items.some((item) => item.id === itemId)) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.orderItem.delete({ where: { id: itemId } });

    const remaining = await tx.orderItem.findMany({ where: { orderId } });

    await tx.order.update({
      where: { id: orderId },
      data: {
        amountTotal: sumBy(remaining, (item) => item.price * item.quantity),
      },
    });
  });

  const orderUpdated = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: ORDER_ITEM_ORDER_BY },
      manifests: true,
      customer: true,
    },
  });

  return Response.json({ order: orderUpdated });
}
