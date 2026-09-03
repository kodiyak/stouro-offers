import z from "zod";
import { PAYMENT_METHODS, TRANSACTION_TARGET_TYPES } from "../../enums";

const common = {
  targetType: z.enum(TRANSACTION_TARGET_TYPES),
  targetId: z.string().min(1),
  description: z.string().min(1),
};

const charge = z.object({
  ...common,
  type: z.literal("CHARGE"),
  amount: z.number().int().positive(),
  metadata: z.object({
    reference: z.string().optional(),
    orderId: z.string().optional(),
  }),
});

const payment = z.object({
  ...common,
  type: z.literal("PAYMENT"),
  amount: z.number().int().positive(),
  metadata: z.discriminatedUnion("source", [
    z.object({
      source: z.literal("ORDER"),
      orderId: z.string().min(1),
    }),
    z.object({
      source: z.literal("MANUAL"),
      method: z.enum(PAYMENT_METHODS),
    }),
  ]),
});

const adjustment = z.object({
  ...common,
  type: z.literal("ADJUSTMENT"),
  amount: z
    .number()
    .int()
    .refine((value) => value !== 0, "amount não pode ser zero"),
  metadata: z.object({
    reason: z.string().min(1),
    orderId: z.string().optional(),
  }),
});

// Estorno: espelho de uma cobrança (CHARGE) cancelada. Não é dinheiro — só
// desfaz o efeito da cobrança no saldo. O resolver aplica o sinal negativo.
const reversal = z.object({
  ...common,
  type: z.literal("REVERSAL"),
  amount: z.number().int().positive(),
  metadata: z.object({
    orderId: z.string().min(1),
  }),
});

export const createTransactionSchema = z.discriminatedUnion("type", [
  charge,
  payment,
  adjustment,
  reversal,
]);
export type CreateTransactionProps = z.infer<typeof createTransactionSchema>;
export type TransactionMetadata = CreateTransactionProps["metadata"];
