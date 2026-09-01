import type { TransactionTargetType } from "@/lib/enums";
import { customerTransactionResolver } from "./customer-transaction";
import type { TransactionInputResolver } from "./protocol";

export function getTransactionInputResolver<T extends TransactionTargetType>(
  type: T,
): TransactionInputResolver<T> {
  const handlers = {
    CUSTOMER: customerTransactionResolver,
  };

  return handlers[type] as TransactionInputResolver<T>;
}
