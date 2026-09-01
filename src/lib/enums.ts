import z from "zod";

export const orderStatusEnum = z.enum(["DRAFT", "PAID", "CANCELLED"]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const productStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export type ProductStatus = z.infer<typeof productStatusEnum>;

export const MANIFEST_DOCUMENT_TYPES = ["HANDWRITTEN", "PRINTED"] as const;
export type ManifestDocumentType = (typeof MANIFEST_DOCUMENT_TYPES)[number];

export const productIconEnum = z.enum(["SHIRT"]);
export type ProductIcon = z.infer<typeof productIconEnum>;
export function toProductIcon(icon: ProductIcon): ProductIcon {
  return icon;
}
