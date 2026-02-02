import type { OrderStatus } from "../enums";

export function useLabels() {
  const ORDER_STATUS: Record<OrderStatus, string> = {
    DRAFT: "Rascunho",
    PAID: "Pago",
    CANCELLED: "Cancelado",
  };

  return { ORDER_STATUS };
}
