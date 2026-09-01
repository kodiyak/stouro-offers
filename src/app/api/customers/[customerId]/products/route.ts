import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const products = await getProducts(customerId, status);
  return Response.json({ products });
}

async function getProducts(customerId: string, status: string | null) {
  return db.product.findMany({
    where: {
      customerId,
      ...(status === "ALL" ? {} : { status: "ACTIVE" }),
    },
    orderBy: { name: "asc" },
  });
}
