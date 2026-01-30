import { cacheLife } from "next/cache";
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
  "use cache";
  cacheLife("hours");

  return db.customer.findUnique({
    where: { id: customerId },
  });
}
