import type { NextRequest } from "next/server";
import { getFinancialOverview } from "@/lib/services/financial";

export async function GET(_req: NextRequest) {
  const data = await getFinancialOverview();
  return Response.json(data);
}
