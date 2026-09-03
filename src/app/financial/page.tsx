"use client";

import { useQuery } from "@tanstack/react-query";
import { ListIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import FinancialSummary from "@/components/financial-summary";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import CustomerLine from "./_components/customer-line";

export default function Page() {
  const { data, isPending } = useQuery({
    queryKey: ["financial"],
    queryFn: api.financial.getOverview,
  });

  return (
    <AppLayout
      title={"Financeiro"}
      description="Confira sua saúde financeira."
      className="p-6"
      footer={
        <Button variant={"outline"} size={"drawer"} asChild>
          <Link href={"/financial/pay"}>
            <PlusIcon />
            <span>Registrar Pagamento</span>
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {isPending || !data ? (
          <span className="text-sm text-muted-foreground">Carregando...</span>
        ) : (
          <>
            <FinancialSummary
              value={data.totals.balance}
              totals={data.totals}
            />
            <Separator />
            <Link href={"/financial/activity"}>
              <Item variant={"outline"}>
                <ItemMedia>
                  <ListIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Extrato</ItemTitle>
                  <ItemDescription>
                    Veja o extrato completo no período selecionado.
                  </ItemDescription>
                </ItemContent>
              </Item>
            </Link>
            <Separator />
            <div className="flex flex-col gap-2">
              {data.customers.length === 0 ? (
                <span className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum cliente ainda.
                </span>
              ) : (
                data.customers.map((customer) => (
                  <CustomerLine key={customer.id} customer={customer} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
