"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpFromLineIcon,
  BanknoteIcon,
  HandCoinsIcon,
  ListIcon,
  PlusIcon,
  ReceiptTextIcon,
} from "lucide-react";
import Link from "next/link";
import ActivityMoneyHeader from "@/components/activity-money-header";
import EmptyCustomers from "@/components/empty/empty-customers";
import AppLayout from "@/components/layouts/app-layout";
import SkeletonFinancial from "@/components/skeletons/skeleton-financial";
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
          <SkeletonFinancial />
        ) : (
          <>
            <ActivityMoneyHeader
              title="Receita Líquida"
              value={data.totals.receivedNet}
              items={[
                {
                  label: "A Receber",
                  icon: <BanknoteIcon className="size-5" />,
                  value: data.receivable,
                },
                {
                  label: "Créditos",
                  icon: <HandCoinsIcon className="size-5" />,
                  value: data.credits,
                },
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
                <EmptyCustomers />
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
