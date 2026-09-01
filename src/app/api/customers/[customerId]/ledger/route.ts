import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/customers/[customerId]/ledger">,
) {
  const { customerId } = await params;

  const ledger = await db.transaction.findMany({
    where: { targetType: "CUSTOMER", targetId: customerId },
    orderBy: { createdAt: "asc" },
  });

  const balance = ledger.reduce((acc, transaction) => {
    return acc + transaction.amount;
  }, 0);

  return Response.json({ ledger, balance });
}
