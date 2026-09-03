"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter } from "@/lib/hooks/use-currency-formatter";
import { cn } from "@/lib/utils";

interface MonthBalancesProps {
  balances: Api.FinancialMonthBalance[];
}

/**
 * Saldo de abertura/fechamento do mês selecionado + 3 meses retroativos,
 * para dar contexto de evolução na UI do extrato.
 */
export default function MonthBalances({ balances }: MonthBalancesProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      {balances.map((row, index) => {
        const isSelected = index === balances.length - 1;
        const label = format(parseISO(`${row.month}-01`), "MMMM yyyy", {
          locale: ptBR,
        });

        return (
          <div
            key={row.month}
            className={cn(
              "flex items-center justify-between gap-4 border-b px-4 py-3 last:border-0",
              isSelected && "bg-muted/40",
            )}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold capitalize">
                {label}
                {isSelected && (
                  <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    selecionado
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                Saldo inicial: {formatCurrency(row.opening)}
              </span>
            </div>
            <span className="shrink-0 font-mono text-sm font-bold">
              {formatCurrency(row.closing)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
