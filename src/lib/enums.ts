import z from "zod";

export const orderStatusEnum = z.enum([
  "DRAFT",
  "COMPLETED",
  "PAID",
  "CANCELLED",
]);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

export const productStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);
export type ProductStatus = z.infer<typeof productStatusEnum>;

export const transactionTypeEnum = z.enum([
  "CHARGE",
  "PAYMENT",
  "ADJUSTMENT",
  "REVERSAL",
]);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

export const TRANSACTION_TARGET_TYPES = ["CUSTOMER"] as const;
export type TransactionTargetType = (typeof TRANSACTION_TARGET_TYPES)[number];

export const RECONCILIATION_STRATEGIES = ["FIFO", "LIFO"] as const;
export type ReconciliationStrategy = (typeof RECONCILIATION_STRATEGIES)[number];

export const PAYMENT_METHODS = ["PIX", "CASH", "TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_GATEWAYS = ["MANUAL", "ASAAS", "MERCADO_PAGO"] as const;
export type PaymentGatewayId = (typeof PAYMENT_GATEWAYS)[number];

export const MANIFEST_DOCUMENT_TYPES = ["HANDWRITTEN", "PRINTED"] as const;
export type ManifestDocumentType = (typeof MANIFEST_DOCUMENT_TYPES)[number];

export const productIconEnum = z.enum(["SHIRT"]);
export type ProductIcon = z.infer<typeof productIconEnum>;
export function toProductIcon(icon: ProductIcon): ProductIcon {
  return icon;
}

export const ERROR_CODES = ["INVALID_INPUT", "NOT_IMPLEMENTED"] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_CATEGORIES = ["VALIDATION", "INTERNAL"] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];
