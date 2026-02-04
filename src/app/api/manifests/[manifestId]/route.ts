import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<"/api/manifests/[manifestId]">,
) {
  const { manifestId } = await params;
  const manifest = await getManifest(manifestId);
  return Response.json({ manifest });
}

async function getManifest(manifestId: string) {
  return db.manifest.findUnique({
    where: { id: manifestId },
  });
}
