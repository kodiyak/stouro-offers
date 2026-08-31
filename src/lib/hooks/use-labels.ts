import type { ManifestDocumentType, OrderStatus } from "../enums";

export function useLabels() {
  const ORDER_STATUS: Record<OrderStatus, string> = {
    DRAFT: "Rascunho",
    PAID: "Pago",
    CANCELLED: "Cancelado",
  };

  const MANIFEST_DOCUMENT_TYPE: Record<ManifestDocumentType, string> = {
    HANDWRITTEN: "Manual",
    PRINTED: "Impresso",
  };

  return { ORDER_STATUS, MANIFEST_DOCUMENT_TYPE };
}
