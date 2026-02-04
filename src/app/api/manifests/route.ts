import { openai } from "@ai-sdk/openai";
import { generateText, Output, tool } from "ai";
import { startOfYear } from "date-fns";
import z from "zod";
import { db } from "@/lib/clients/db";
import { s3 } from "@/lib/services";
import { manifestSchema } from "@/lib/types";
import { getYearlyPosition } from "@/lib/utils";

async function bufferToBase64(buffer: Buffer): Promise<string> {
  return buffer.toString("base64");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

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
    const [path, { text, output, ...rest }] = await Promise.all([
      await s3.upload({
        path: `manifests/${Date.now()}-${file.name}`,
        file: buffer,
      }),
      await generateManifest(file, buffer),
    ]);

    const now = new Date();
    const manifestNumber = await db.manifest.count({
      where: {
        createdAt: { gte: startOfYear(now) },
      },
    });
    const { id: manifestId } = await db.manifest.create({
      data: {
        manifestNumber: getYearlyPosition(
          now.getFullYear(),
          manifestNumber + 1,
        ),
        documentType: output.documentType,
        payload: output as never,
        fileUrl: s3.publicUrl({ path }),
        fileSize: buffer.length,
        fileType: file.type,
      },
    });

    return Response.json(
      {
        success: true,
        text,
        output,
        size: buffer.length,
        manifestId,
        rest,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("upload error", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateManifest(file: File, buffer: Buffer) {
  const base64Data = `data:${file.type};base64,${await bufferToBase64(buffer)}`;

  const result = await generateText({
    model: openai("gpt-4.1-mini"),
    messages: [
      {
        role: "system",
        content: [
          "Você é um assistente especializado em processar romaneios de confecção de uma costureira.",
          "Seu trabalho é extrair informações estruturadas de imagens de romaneios enviadas pelos usuários.",
          "---",
          "## Instruções Gerais",
          "- Você deve identificar a empresa responsável pelo romaneio e usar o nome dela como cliente.",
          "- A empresa secundária (Cliente do meu cliente) deve ser alocada em `customer.partner` com o nome (se disponível).",
          "- Busque classificar cada item entre as peças: Polo, Camisa, Camiseta, Moletom, Calça Moletom, Jaqueta, etc...",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              "Processe o romaneio anexado, você deve extrair:",
              '1. Classifique o Documento: "INTERNAL" ou "EXTERNAL"',
              "2. Nome e Informações Adicionais do Cliente (NONE se não encontrar)",
              "3. Itens do Romaneio: Descrição (Formatado como Título), quantidade (0 se não tiver CERTEZA) e preço unitário (0 se não tiver CERTEZA) de cada item",
              "---",
              "INTERNAL: Romaneio manual em folha de caderno.",
              "EXTERNAL: Romaneio impresso.",
            ].join("\n"),
          },
          {
            type: "image",
            image: base64Data,
            mediaType: file.type,
          },
        ],
      },
    ],
    output: Output.object({
      name: "ManifestData",
      description: "Dados extraídos do manifesto na imagem",
      schema: z.object({
        fullText: z.string(),
        ...manifestSchema.shape,
      }),
    }),
  });

  return result;
}
