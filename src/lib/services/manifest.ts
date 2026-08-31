import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import z from "zod";
import { db } from "@/lib/clients/db";
import { toProductIcon } from "@/lib/enums";
import { type IManifestItem, manifestSchema } from "@/lib/types";

export interface ResolvedItem {
  payloadItem: IManifestItem;
  productId: string;
  name: string;
  price: number; // centavos
  quantity: number;
  created: boolean;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

async function bufferToBase64(buffer: Buffer): Promise<string> {
  return buffer.toString("base64");
}

export async function generateManifest(file: File, buffer: Buffer) {
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

/**
 * Resolve os itens extraídos do romaneio contra o catálogo do cliente.
 * - Acha match por nome normalizado → reusa o produto, preço do romaneio se vier (senão o do catálogo).
 * - Sem match → cria um Product novo a partir da descrição/preço do romaneio.
 */
export async function resolveProducts(
  customerId: string,
  items: IManifestItem[],
): Promise<ResolvedItem[]> {
  const catalog = await db.product.findMany({ where: { customerId } });
  const catalogByName = new Map(
    catalog.map((product) => [normalizeName(product.name), product]),
  );

  const resolved: ResolvedItem[] = [];

  await db.$transaction(async (tx) => {
    for (const item of items) {
      const quantity = Math.max(0, Math.round(item.quantity));

      const existing = catalogByName.get(normalizeName(item.description));

      if (existing) {
        resolved.push({
          payloadItem: item,
          productId: existing.id,
          name: existing.name,
          price: item.unitPrice > 0 ? toCents(item.unitPrice) : existing.price,
          quantity,
          created: false,
        });
        continue;
      }

      const product = await tx.product.create({
        data: {
          name: item.description,
          price: toCents(item.unitPrice),
          icon: toProductIcon("SHIRT"),
          customer: { connect: { id: customerId } },
        },
      });

      resolved.push({
        payloadItem: item,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        created: true,
      });
    }
  });

  return resolved;
}
