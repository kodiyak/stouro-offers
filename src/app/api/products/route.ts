import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { toProductIcon } from "@/lib/enums";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  customerId: z.string(),
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
  const product = await db.product.create({
    data: {
      name: data.name,
      price: Number(data.price.toFixed(2).replace(".", "")),
      icon: toProductIcon("SHIRT"),
      customer: { connect: { id: data.customerId } },
    },
  });

  return Response.json({ product });
}
