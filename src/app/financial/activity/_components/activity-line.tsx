"use client";

import {
  ArrowDownToLineIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
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
      <span className="shrink-0 font-mono text-sm font-bold">
        {formatCurrency(Math.abs(item.amount))}
      </span>
    </div>
  );
}
