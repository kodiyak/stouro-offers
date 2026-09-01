import { format, startOfYear } from "date-fns";
import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { ORDER_ITEM_ORDER_BY, sumBy } from "@/lib/utils";

const schema = z.object({
  customerId: z.string(),
  products: z.record(z.string(), z.number()),
});

export async function POST(req: NextRequest) {
  const body = schema.safeParse(await req.json());

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

  if (products.length !== Object.keys(data.products).length) {
    return Response.json(
      { error: "Alguns produtos não pertencem a este cliente" },
      { status: 400 },
    );
  }

  const amountTotal = sumBy(products, (product) => {
    const quantity = data.products[product.id] || 0;
    return product.price * quantity;
  });
  const position = (await db.order.count()) + 1;
  const now = new Date();
  const year = format(startOfYear(now), "yyyy");
  const yearPosition = await db.order.count({
    where: { createdAt: { gte: startOfYear(now) } },
  });
  const orderNumber = [year, String(yearPosition).padStart(5, "0")].join("");
  const order = await db.order.create({
    data: {
      customer: { connect: { id: data.customerId } },
      amountTotal,
      position,
      orderNumber,
      items: {
        createMany: {
          data: products.map((product) => ({
            name: product.name,
            productId: product.id,
            price: product.price,
            quantity: data.products[product.id] || 0,
          })),
        },
      },
    },
    include: { items: { orderBy: ORDER_ITEM_ORDER_BY }, customer: true },
  });

  return Response.json({ order });
}

export async function GET() {
  const orders = await db.order.findMany({
    include: { items: { orderBy: ORDER_ITEM_ORDER_BY }, customer: true },
    orderBy: { position: "desc" },
  });

  return Response.json({ orders });
}
