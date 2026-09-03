import type { NextRequest } from "next/server";
import z from "zod";
import { markAsCancelled } from "@/lib/services/order";
import { isAppError } from "@/lib/utils/error";

const schema = z.object({
  refund: z
    .object({
      amount: z.number().int().positive(),
    })
    .optional(),
});

export async function POST(
  req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/cancel">,
) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // POST sem body (cancelamento direto de DRAFT/COMPLETED).
  }

  const parsed = schema.safeParse(body);

  if (parsed.error) {
    return Response.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const { orderId } = await params;
    const { order } = await markAsCancelled({
      orderId,
      refund: parsed.data.refund,
    });
    return Response.json({ order });
  } catch (error) {
    if (isAppError(error)) {
      return Response.json({ error: error.toJSON() }, { status: 400 });
    }

    return Response.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
