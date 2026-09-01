import type { TransactionTargetType } from "@/lib/enums";
import type { TransactionMetadata } from "@/lib/utils/validations/transaction";
import type { Api } from "./types";
import { http } from "./utils";

export async function createTransaction(data: {
  targetType: TransactionTargetType;
  targetId: string;
  type: "CHARGE" | "PAYMENT" | "ADJUSTMENT";
  amount: number; // em centavos
  description: string;
  metadata: TransactionMetadata;
}) {
  return http
    .post<{ transaction: Api.Transaction }>("/transactions", data)
    .then((res) => res.data);
}

export async function getLedger({ customerId }: { customerId: string }) {
  return http
    .get<{ ledger: Api.Transaction[]; balance: number }>(
      `/customers/${customerId}/ledger`,
    )
    .then((res) => res.data);
}
