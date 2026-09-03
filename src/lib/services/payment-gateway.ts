import { APP_CONFIG } from "@/app.config";
import type { PaymentGatewayId } from "../enums";
import { AppError } from "../utils/error";

export interface PaymentGatewayRefundProps {
  orderId: string;
  amount: number; // centavos
}

export interface PaymentGateway {
  id: PaymentGatewayId;
  label: string;
  refund(props: PaymentGatewayRefundProps): Promise<void>;
}

/**
 * Reembolso manual: nenhuma ação externa — o estorno contábil é feito pelo
 * ADJUSTMENT lançado no cancelamento (markAsCancelled).
 */
const manualGateway: PaymentGateway = {
  id: "MANUAL",
  label: "Manual",
  async refund() {},
};

/** Boilerplate — contrato futuro. Nenhum gateway foi implementado ainda. */
const asaasGateway: PaymentGateway = {
  id: "ASAAS",
  label: "Asaas",
  async refund() {
    throw new AppError({
      code: "NOT_IMPLEMENTED",
      category: "INTERNAL",
      message: "Asaas gateway not implemented yet",
    });
  },
};

/** Boilerplate — contrato futuro. Nenhum gateway foi implementado ainda. */
const mercadoPagoGateway: PaymentGateway = {
  id: "MERCADO_PAGO",
  label: "Mercado Pago",
  async refund() {
    throw new AppError({
      code: "NOT_IMPLEMENTED",
      category: "INTERNAL",
      message: "Mercado Pago gateway not implemented yet",
    });
  },
};

const gateways: Record<PaymentGatewayId, PaymentGateway> = {
  MANUAL: manualGateway,
  ASAAS: asaasGateway,
  MERCADO_PAGO: mercadoPagoGateway,
};

export function getPaymentGateway(id: PaymentGatewayId): PaymentGateway {
  return gateways[id];
}

/** Gateway ativo (async: hoje lê a config; no futuro pode vir do banco). */
export async function getActivePaymentGateway(): Promise<PaymentGateway> {
  return gateways[APP_CONFIG.payments.gateway];
}
