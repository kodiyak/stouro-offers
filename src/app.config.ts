export const APP_CONFIG = {
  name: "Aura",
  description: "Gestão para Ateliê de Costura",
  company: {
    name: "Paty",
    email: "patricia-teodoro_@hotmail.com",
    phone: "+55 (11) 9 5930-2924",
  },
  pdf: {
    filenamePrefix: "paty-pedido",
  },
  reconciliation: {
    strategy: "FIFO",
  },
  payments: {
    // Gateway de pagamento ativo. Hoje apenas MANUAL é implementado;
    // ASAAS/MERCADO_PAGO são boilerplate para o futuro.
    gateway: "MANUAL",
  },
} as const;
export type AppConfig = typeof APP_CONFIG;
