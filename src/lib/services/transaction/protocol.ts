import type { CreateTransactionProps } from "@/lib/utils/validations/transaction";

export type TransactionInputResolverProps = CreateTransactionProps & {
  targetId: string;
};
export type TransactionInputResolver = (
  props: TransactionInputResolverProps,
) => Promise<void>;
