import z from "zod";

export const orderStatusEnum = z.enum(["DRAFT", "PAID", "CANCELLED"]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const productIconEnum = z.enum(["SHIRT"]);
export type ProductIcon = z.infer<typeof productIconEnum>;
export function toProductIcon(icon: ProductIcon): ProductIcon {
  return icon;
}
