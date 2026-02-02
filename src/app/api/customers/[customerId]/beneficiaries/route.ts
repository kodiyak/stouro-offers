import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { customerId: string } },
) {
  const { customerId } = params;

  const beneficiaries = await db.beneficiary.findMany({
    where: { customerId },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ beneficiaries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } },
) {
  const schema = z.object({
    name: z.string().min(1),
  });

  const body = schema.safeParse(await req.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const { data } = body;
  const { customerId } = params;

  const beneficiary = await db.beneficiary.create({
    data: {
      name: data.name,
      customerId,
    },
  });

  return Response.json({ beneficiary });
}
