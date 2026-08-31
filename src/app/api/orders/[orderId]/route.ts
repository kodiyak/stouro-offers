import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]">,
) {
  const { orderId } = await params;
  const order = await getOrder(orderId);
  return Response.json({ order });
}

async function getOrder(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: { items: true, manifests: true, customer: true },
  });
}
