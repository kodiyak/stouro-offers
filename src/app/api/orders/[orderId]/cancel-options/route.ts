import type { NextRequest } from "next/server";
import { getCancelOptions } from "@/lib/services/order";
import { isAppError } from "@/lib/utils/error";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/cancel-options">,
) {
  try {
    const { orderId } = await params;
    const options = await getCancelOptions({ orderId });
    return Response.json(options);
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
