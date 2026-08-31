import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";
import { ORDER_ITEM_ORDER_BY } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/cancel">,
) {
  const { orderId } = await params;

  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (existing.status === "CANCELLED") {
    return Response.json({ error: "Order already cancelled" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    include: { items: { orderBy: ORDER_ITEM_ORDER_BY }, customer: true },
  });

  return Response.json({ order });
}
