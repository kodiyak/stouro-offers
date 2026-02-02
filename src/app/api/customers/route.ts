import { cacheLife } from "next/cache";
import { db } from "@/lib/clients/db";

export async function GET() {
  const customers = await getCustomers();
  return Response.json({ customers });
}

async function getCustomers() {
  return db.customer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { orders: true, products: true } },
    },
  });
}
