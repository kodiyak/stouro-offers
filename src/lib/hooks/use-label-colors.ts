import type { OrderStatus } from "../enums";

export function useLabelColors() {
  const ORDER_STATUS: Record<OrderStatus, string> = {
    DRAFT: "bg-amber-500/15 text-amber-500",
    PAID: "bg-emerald-500/15 text-emerald-500",
    CANCELLED: "bg-red-500/15 text-red-500",
  };

  return { ORDER_STATUS };
}
