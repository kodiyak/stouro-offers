import type { NextRequest } from "next/server";
import z from "zod";
import { db } from "@/lib/clients/db";
import { getTransactionInputResolver } from "@/lib/services/transaction";
import { isAppError } from "@/lib/utils/error";
import { createTransactionSchema } from "@/lib/utils/validations/transaction";

export async function POST(req: NextRequest) {
  const body = createTransactionSchema.safeParse(await req.json());

  if (body.error) {
    return Response.json(
      { error: z.treeifyError(body.error) },
      { status: 400 },
    );
  }

  const { data } = body;
  const transactionInputResolver = getTransactionInputResolver(data.targetType);

  try {
    await transactionInputResolver(data);
    const transaction = await db.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        description: data.description,
        metadata: data.metadata,
      },
    });

    return Response.json({ transaction });
  } catch (error) {
    if (isAppError(error)) {
      return Response.json({ error: error.toJSON() }, { status: 400 });
    }

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
