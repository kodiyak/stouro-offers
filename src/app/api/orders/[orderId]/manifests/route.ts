import type { NextRequest } from "next/server";
import { db } from "@/lib/clients/db";
import { manifest, s3 } from "@/lib/services";
import { ORDER_ITEM_ORDER_BY, sumBy } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/orders/[orderId]/manifests">,
) {
  try {
    const { orderId } = await params;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: { orderBy: ORDER_ITEM_ORDER_BY } },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (typeof file.size !== "number" || file.size > MAX_SIZE) {
      return Response.json(
        { error: "File too large. Max 5MB" },
        { status: 413 },
      );
    }

    if (typeof file.type !== "string" || !file.type.startsWith("image/")) {
      return Response.json(
        { error: "Only image files are allowed" },
        { status: 415 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const [path, { output }] = await Promise.all([
      s3.upload({ path: `manifests/${Date.now()}-${file.name}`, file: buffer }),
      manifest.generateManifest(file, buffer),
    ]);

    const items = (output.items ?? []).filter((item) => item.quantity > 0);

    const resolved = await manifest.resolveProducts(order.customerId, items);

    const orderItemsData = resolved
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        orderId,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

    const amountTotal = sumBy(
      orderItemsData,
      (item) => item.price * item.quantity,
    );
    const previousTotal = sumBy(
      order.items,
      (item) => item.price * item.quantity,
    );

    const manifestRow = await db.$transaction(async (tx) => {
      const created = await tx.orderItem.createMany({
        data: orderItemsData,
      });

      const manifest = await tx.manifest.create({
        data: {
          order: { connect: { id: orderId } },
          customer: { connect: { id: order.customerId } },
          documentType: output.documentType,
          payload: output as never,
          fileUrl: s3.publicUrl({ path }),
          fileSize: buffer.length,
          fileType: file.type,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { amountTotal: previousTotal + amountTotal },
      });

      return { manifest, createdCount: created.count };
    });

    const updated = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { orderBy: ORDER_ITEM_ORDER_BY },
        manifests: true,
        customer: true,
      },
    });

    return Response.json(
      {
        success: true,
        manifest: manifestRow.manifest,
        order: updated,
        addedItems: manifestRow.createdCount,
        createdProducts: resolved.filter((item) => item.created).length,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("upload manifest error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
