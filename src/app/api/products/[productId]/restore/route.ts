import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/products/[productId]/restore">,
) {
  const { productId } = await params;

  const existing = await db.product.findUnique({ where: { id: productId } });

  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  if (existing.status === "ACTIVE") {
    return Response.json({ error: "Product already active" }, { status: 400 });
  }

  const product = await db.product.update({
    where: { id: productId },
    data: { status: "ACTIVE" },
  });

  return Response.json({ product });
}
