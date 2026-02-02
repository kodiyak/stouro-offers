import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";

export async function GET() {
  const customers = await getCustomers();
  return Response.json({ customers });
}

export async function POST(req: NextRequest) {
  const schema = z.object({
    name: z.string().min(1),
    color: z.string().min(1),
  });

  const body = schema.safeParse(await req.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const { data } = body;
  const customer = await db.customer.create({
    data: {
      name: data.name,
      color: data.color,
    },
  });

  return Response.json({ customer });
}

async function getCustomers() {
  return db.customer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
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
