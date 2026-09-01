import type { OrderStatus, ProductStatus } from "../enums";

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

  return { ORDER_STATUS, PRODUCT_STATUS };
}
