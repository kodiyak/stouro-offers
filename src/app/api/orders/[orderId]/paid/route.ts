import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/paid">,
) {
  const { orderId } = await params;

  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (existing.status === "PAID") {
    return Response.json({ error: "Order already paid" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
    include: { items: true, customer: true },
  });

  return Response.json({ order });
}
