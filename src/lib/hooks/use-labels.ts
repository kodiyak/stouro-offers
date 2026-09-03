import type {
  ManifestDocumentType,
  OrderStatus,
  TransactionTargetType,
  TransactionType,
} from "../enums";

export function useLabels() {
  const ORDER_STATUS: Record<OrderStatus, string> = {
    DRAFT: "Rascunho",
    COMPLETED: "Concluído",
    PAID: "Pago",
    CANCELLED: "Cancelado",
  };

  const MANIFEST_DOCUMENT_TYPE: Record<ManifestDocumentType, string> = {
    HANDWRITTEN: "Manual",
    PRINTED: "Impresso",
  };

  const TRANSACTION_TYPE: Record<TransactionType, string> = {
    CHARGE: "Cobrança",
    PAYMENT: "Pagamento",
    ADJUSTMENT: "Ajuste",
  };

  const TRANSACTION_TARGET_TYPE: Record<TransactionTargetType, string> = {
    CUSTOMER: "Cliente",
  };

  return {
    ORDER_STATUS,
    MANIFEST_DOCUMENT_TYPE,
    TRANSACTION_TYPE,
    TRANSACTION_TARGET_TYPE,
  };
}
