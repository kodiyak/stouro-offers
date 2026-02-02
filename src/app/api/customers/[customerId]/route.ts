import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;
  const customer = await getCustomer(customerId);
  return Response.json({ customer });
}

async function getCustomer(customerId: string) {
  return db.customer.findUnique({
    where: { id: customerId },
    include: {
      _count: {
        select: {
          orders: { where: { status: { not: "CANCELLED" } } },
          products: { where: { status: "ACTIVE" } },
        },
      },
    },
  });
}
