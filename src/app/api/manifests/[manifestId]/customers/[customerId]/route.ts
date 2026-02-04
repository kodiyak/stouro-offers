import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function POST(
  _req: NextRequest,
  {
    params,
  }: RouteContext<"/api/manifests/[manifestId]/customers/[customerId]">,
) {
  const { manifestId, customerId } = await params;

  const manifest = await db.manifest.update({
    where: { id: manifestId },
    data: { customer: { connect: { id: customerId } } },
    include: { customer: true },
  });

  return Response.json({ manifest });
}
