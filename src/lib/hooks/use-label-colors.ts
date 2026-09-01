import type { OrderStatus, ProductStatus, TransactionType } from "../enums";

export function useLabelColors() {
  const ORDER_STATUS: Record<OrderStatus, string> = {
    DRAFT: "bg-amber-500/15 text-amber-500",
    PAID: "bg-emerald-500/15 text-emerald-500",
    CANCELLED: "bg-red-500/15 text-red-500",
  };

  const PRODUCT_STATUS: Record<ProductStatus, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-500",
    INACTIVE: "bg-muted text-muted-foreground",
  };

  const TRANSACTION_TYPE: Record<TransactionType, string> = {
    CHARGE: "bg-amber-500/15 text-amber-500",
    PAYMENT: "bg-emerald-500/15 text-emerald-500",
    ADJUSTMENT: "bg-sky-500/15 text-sky-500",
  };

  return { ORDER_STATUS, PRODUCT_STATUS, TRANSACTION_TYPE };
}
