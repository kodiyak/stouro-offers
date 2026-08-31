import type { Prisma } from "@/generated/prisma/client";

/**
 * Ordenação estável para os itens de um pedido.
 * O `createdAt` é o mesmo para itens criados no mesmo `createMany`
 * (timestamp da transação), então usamos o `id` como desempate
 * para que a ordem nunca mude ao editar itens.
 */
export const ORDER_ITEM_ORDER_BY: Prisma.OrderItemOrderByWithRelationInput[] = [
  { createdAt: "asc" },
  { id: "asc" },
];
