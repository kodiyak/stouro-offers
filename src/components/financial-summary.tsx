"use client";

import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  ReceiptTextIcon,
  WalletIcon,
} from "lucide-react";
import type { Api } from "@/lib/clients/api/types";
import ActivityMoneyHeader from "./activity-money-header";

interface FinancialSummaryProps {
  title?: string;
  value?: number;
  totals: Api.FinancialTotals;
}

/**
 * Header financeiro com o Balanço e os itens derivados das transações:
 * cobrado, pago, reembolsos e o que foi efetivamente recebido.
 */
export default function FinancialSummary({
  title = "Balanço",
  value,
  totals,
}: FinancialSummaryProps) {
  return (
    <ActivityMoneyHeader
      title={title}
      value={value ?? totals.balance}
      items={[
        {
          label: "Total cobrado",
          icon: <ReceiptTextIcon className="size-5" />,
          value: totals.charged,
        },
        {
          label: "Total pago",
          icon: <ArrowDownToLineIcon className="size-5" />,
          value: totals.paid,
        },
        {
          label: "Reembolsos",
          icon: <ArrowUpFromLineIcon className="size-5" />,
          value: totals.refunds,
        },
        {
          label: "Pago de verdade",
          icon: <WalletIcon className="size-5" />,
          value: totals.receivedNet,
        },
      ]}
    />
  );
}
