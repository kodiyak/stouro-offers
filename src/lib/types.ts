import z from "zod";

export const manifestItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z
    .number()
    .describe("Preço unitário em float, ex: 3.5 para R$3,50"),
});
export type IManifestItem = z.infer<typeof manifestItemSchema>;

export const manifestSchema = z.object({
  documentType: z.enum(["HANDWRITTEN", "PRINTED"]),
  customer: z
    .object({
      name: z.string(),
      cnpj: z.union([z.string(), z.null()]),
      cpf: z.union([z.string(), z.null()]),
      address: z.union([z.string(), z.null()]),
      phone: z.union([z.string(), z.null()]),
      email: z.union([z.string(), z.null()]),
      partner: z.union([z.string(), z.null()]),
    })
    .loose(),
  items: manifestItemSchema.array(),
});
export type IManifest = z.infer<typeof manifestSchema>;
