export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as any;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
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
  } catch (err) {
    console.error("upload error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
