import type { NextRequest } from "next/server";
import { markAsCompleted } from "@/lib/services/order";
import { isAppError } from "@/lib/utils/error";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/complete">,
) {
  try {
    const { orderId } = await params;
    const { order } = await markAsCompleted({ orderId });
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
