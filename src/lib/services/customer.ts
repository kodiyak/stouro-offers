import { db } from "../clients/db";

/**
 * Elegibilidade do cliente para cancelar pedidos pagos (async).
 * Hoje: cliente existe e está ACTIVE. No futuro: regras do gateway/limite.
 */
export async function isCustomerEligibleForCancellation({
  customerId,
}: {
  customerId: string;
}): Promise<boolean> {
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  return Boolean(customer && customer.status === "ACTIVE");
}
