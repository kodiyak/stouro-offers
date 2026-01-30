import { cacheLife } from "next/cache";
import { db } from "@/lib/clients/db";

export async function GET() {
  const customers = await getCustomers();
  return Response.json({ customers });
}

async function getCustomers() {
  "use cache";
  cacheLife("hours");

  return db.customer.findMany();
}
