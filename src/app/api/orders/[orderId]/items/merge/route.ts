import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { ORDER_ITEM_ORDER_BY, sumBy } from "@/lib/utils";

const schema = z.object({
  itemId: z.string().min(1),
  itemIds: z.array(z.string().min(1)).min(1),
});

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/items/merge">,
) {
  const { orderId } = await params;
  const body = schema.safeParse(await request.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const { itemId, itemIds } = body.data;

  const items = await db.orderItem.findMany({
    where: { id: { in: [itemId, ...itemIds] } },
  });

  const missing = [itemId, ...itemIds].filter(
    (id) => !items.some((item) => item.id === id),
  );
  if (missing.length > 0) {
    return Response.json(
      { error: "Some items were not found" },
      { status: 404 },
    );
  }

  const foreign = items.filter((item) => item.orderId !== orderId);
  if (foreign.length > 0) {
    return Response.json(
      { error: "Items do not belong to this order" },
      { status: 400 },
    );
  }

  const target = items.find((item) => item.id === itemId);
  const toMerge = items.filter((item) => item.id !== itemId);
  if (!target) {
    return Response.json({ error: "Target item not found" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.orderItem.update({
      where: { id: target.id },
      data: {
        quantity: target.quantity + sumBy(toMerge, (item) => item.quantity),
      },
    });

    await tx.orderItem.deleteMany({
      where: { id: { in: toMerge.map((item) => item.id) } },
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
  });

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: ORDER_ITEM_ORDER_BY },
      manifests: true,
      customer: true,
    },
  });

  return Response.json({ order });
}
