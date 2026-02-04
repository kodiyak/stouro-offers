import z from "zod";

export const manifestItemSchema = z.object({
  description: z.string(),
  price: z.number(),
  quantity: z.number(),
});
export type IManifestItem = z.infer<typeof manifestItemSchema>;

export const manifestSchema = z.object({
  type: z.enum(["EXTERNAL", "INTERNAL"]),
  items: manifestItemSchema.array(),
});
export type IManifest = z.infer<typeof manifestSchema>;
