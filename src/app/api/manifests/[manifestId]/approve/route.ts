import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function POST(
  _req: NextRequest,
  { params }: RouteContext<"/api/manifests/[manifestId]/approve">,
) {
  const { manifestId } = await params;

  const existing = await db.manifest.findUnique({ where: { id: manifestId } });

  if (!existing) {
    return Response.json({ error: "Manifest not found" }, { status: 404 });
  }

  if (existing.status === "APPROVED") {
    return Response.json(
      { error: "Manifest already approved" },
      { status: 400 },
    );
  }

  const manifest = await db.manifest.update({
    where: { id: manifestId },
    data: { status: "APPROVED" },
  });

  return Response.json({ manifest });
}
