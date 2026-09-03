"use client";

import {
  ArrowDownToLineIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  Undo2Icon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { Api } from "@/lib/clients/api/types";
import {
  useCurrencyFormatter,
  useDateFormatter,
  useLabelColors,
  useLabels,
} from "@/lib/hooks";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<
  Api.Transaction["type"],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  CHARGE: ReceiptTextIcon,
  PAYMENT: ArrowDownToLineIcon,
  ADJUSTMENT: RotateCcwIcon,
  REVERSAL: Undo2Icon,
};

interface ActivityLineProps {
  item: Api.FinancialActivityItem;
}

export default function ActivityLine({ item }: ActivityLineProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const labels = useLabels();
  const { TRANSACTION_TYPE: COLORS } = useLabelColors();
  const Icon = TYPE_ICONS[item.type];

  // Ajustes e estornos exibem com sinal (estorno é cobrança cancelada −).
  // Pagamento é dinheiro entrando → ganha + e verde; cobrança é só fatura
  // emitida → fica em cinza discreto (não é dinheiro no caixa ainda).
  const showsSign = item.type === "ADJUSTMENT" || item.type === "REVERSAL";
  const value = showsSign ? item.amount : Math.abs(item.amount);
  const prefix = item.type === "PAYMENT" ? "+" : value < 0 ? "-" : "";

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
      <div className="rounded-xl bg-muted p-2">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold">
          {item.description}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {formatDate(item.createdAt, "PPp")}
          {item.customer ? ` · ${item.customer.name}` : ""}
        </span>
        <span
          className={cn(
            "w-fit rounded-full px-1.5 py-px text-[10px] font-bold",
            COLORS[item.type],
          )}
        >
          {labels.TRANSACTION_TYPE[item.type]}
        </span>
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-sm font-bold",
          item.type === "PAYMENT" && "text-emerald-500",
          item.type === "CHARGE" && "text-muted-foreground",
          showsSign && value < 0 && "text-destructive",
        )}
      >
        {prefix}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
