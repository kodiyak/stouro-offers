import type { TransactionTargetType } from "@/lib/enums";
import type { CreateTransactionProps } from "@/lib/utils/validations/transaction";

export type TransactionInputResolverProps = CreateTransactionProps & {
  targetId: string;
};
export type TransactionInputResolverResult<T extends TransactionTargetType> = {
  targetType: T;
  amount: number;
  description: string;
  metadata: CreateTransactionProps["metadata"];
  type: CreateTransactionProps["type"];
  targetId: string;
};
export type TransactionInputResolver<T extends TransactionTargetType> = (
  props: TransactionInputResolverProps,
) => Promise<TransactionInputResolverResult<T>>;
