import type { NextRequest } from "next/server";
import z from "zod";
import { getFinancialActivity } from "@/lib/services/financial";

const schema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

export async function GET(req: NextRequest) {
  const search = new URL(req.url).searchParams;
  const parsed = schema.safeParse({ month: search.get("month") });

  if (parsed.error) {
    return Response.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const data = await getFinancialActivity({ month: parsed.data.month });
  return Response.json(data);
}
