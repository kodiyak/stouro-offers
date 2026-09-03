"use client";

import { useQuery } from "@tanstack/react-query";
import { format, startOfDay } from "date-fns";
import { ArrowUpFromLineIcon, ReceiptTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import ActivityMoneyHeader from "@/components/activity-money-header";
import AppLayout from "@/components/layouts/app-layout";
import MonthPicker from "@/components/month-picker";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import type { Api } from "@/lib/clients/api/types";
import { useDateFormatter } from "@/lib/hooks";
import ActivityLine from "./_components/activity-line";
import MonthBalances from "./_components/month-balances";

export default function Page() {
  const { formatDate } = useDateFormatter();
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const { data, isPending } = useQuery({
    queryKey: ["financial", "activity", month],
    queryFn: () => api.financial.getActivity({ month }),
  });

  const groups = useMemo(() => {
    if (!data) return [];
    const grouped: Record<string, Api.FinancialActivityItem[]> = {};
    data.items.forEach((item) => {
      const day = startOfDay(new Date(item.createdAt)).toISOString();
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(item);
    });
    return Object.entries(grouped).sort(([a], [b]) => {
      return a < b ? 1 : -1;
    });
  }, [data]);

  return (
    <AppLayout
      title={"Extrato"}
      description="Extrato completo no período selecionado."
      className="p-0"
      goBack={"/financial"}
    >
      <div className="flex flex-col">
        <MonthPicker month={month} onChange={setMonth} />
        {isPending || !data ? (
          <span className="p-4 text-sm text-muted-foreground">
            Carregando...
          </span>
        ) : (
          <div className="flex flex-col">
            <ActivityMoneyHeader
              title="Balanço do mês"
              value={data.balances.at(-1)?.closing ?? data.totals.balance}
              items={[
                {
                  label: "Total cobrado",
                  icon: <ReceiptTextIcon className="size-5" />,
                  value: data.totals.charged,
                },
                {
                  label: "Reembolsos",
                  icon: <ArrowUpFromLineIcon className="size-5" />,
                  value: data.totals.refunds,
                },
              ]}
            />
            <div className="flex flex-col gap-3 p-4">
              <span className="text-sm font-semibold">Saldos mensais</span>
              <MonthBalances balances={data.balances} />
            </div>
          </div>
        )}
        <Separator />
        {data && groups.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-16 text-center">
            <span className="text-sm text-muted-foreground">
              Nenhuma movimentação neste mês.
            </span>
          </div>
        ) : (
          groups.map(([day, items]) => (
            <div key={day} className="flex flex-col">
              <div className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground">
                {formatDate(day, "PP")}
              </div>
              {items.map((item) => (
                <ActivityLine key={item.id} item={item} />
              ))}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
