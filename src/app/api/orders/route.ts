import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { sumBy } from "@/lib/utils";

const schema = z.object({
  customerId: z.string(),
  products: z.record(z.string(), z.number()),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());

  console.log(body);

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const { data } = body;
  const products = await db.product.findMany({
    where: {
      id: { in: Object.keys(data.products) },
      customerId: data.customerId,
    },
  });

  const amountTotal = sumBy(products, (product) => {
    const quantity = data.products[product.id] || 0;
    return product.price * quantity;
  });
  const position = (await db.order.count()) + 1;
  const order = await db.order.create({
    data: {
      customer: { connect: { id: data.customerId } },
      amountTotal,
      position,
      items: {
        createMany: {
          data: products.map((product) => ({
            name: product.name,
            productId: product.id,
            amountTotal: product.price * (data.products[product.id] || 0),
            price: product.price,
            quantity: data.products[product.id] || 0,
          })),
        },
      },
    },
    include: { items: true, customer: true },
  });

  return Response.json({ order });
}

export async function GET() {
  const orders = await db.order.findMany({
    include: { items: true, customer: true },
    orderBy: { position: "desc" },
  });

  return Response.json({ orders });
}
