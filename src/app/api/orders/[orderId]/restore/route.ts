import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/restore">,
) {
  const { orderId } = await params;

  const existing = await db.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  if (existing.status === "DRAFT") {
    return Response.json({ error: "Order already in draft" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "DRAFT" },
    include: { items: true, customer: true },
  });

  return Response.json({ order });
}
