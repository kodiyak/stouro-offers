import z from "zod";
import { TRANSACTION_TARGET_TYPES } from "../../enums";

const common = {
  targetType: z.enum(TRANSACTION_TARGET_TYPES),
  targetId: z.string().min(1),
  amount: z
    .number()
    .int()
    .refine((value) => value !== 0, "amount não pode ser zero"),
  description: z.string().min(1),
};

const charge = z.object({
  ...common,
  type: z.literal("CHARGE"),
  metadata: z.object({ reference: z.string().optional() }),
});

const payment = z.object({
  ...common,
  type: z.literal("PAYMENT"),
  metadata: z.discriminatedUnion("source", [
    z.object({
      source: z.literal("ORDER"),
      orderId: z.string().min(1),
    }),
    z.object({
      source: z.literal("MANUAL"),
      method: z.enum(["PIX", "CASH", "TRANSFER"]),
    }),
  ]),
});

const adjustment = z.object({
  ...common,
  type: z.literal("ADJUSTMENT"),
  metadata: z.object({ reason: z.string().min(1) }),
});

export const createTransactionSchema = z.discriminatedUnion("type", [
  charge,
  payment,
  adjustment,
]);
export type CreateTransactionProps = z.infer<typeof createTransactionSchema>;
export type TransactionMetadata = CreateTransactionProps["metadata"];
