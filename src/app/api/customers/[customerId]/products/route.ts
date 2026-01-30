import { cacheLife } from "next/cache";
import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;
  const products = await getProducts(customerId);
  return Response.json({ products });
}

async function getProducts(customerId: string) {
  "use cache";
  cacheLife("hours");

  return db.product.findMany({ where: { customerId } });
}
