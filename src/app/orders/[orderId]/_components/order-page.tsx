"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSignIcon,
  DownloadIcon,
  EllipsisIcon,
  ShareIcon,
} from "lucide-react";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Description } from "@/components/ui/description";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import {
  useCurrencyFormatter,
  useDateFormatter,
  useDisclosure,
} from "@/lib/hooks";
import ListOrderItems from "./list-order-items";
import OrderMoreOptions from "./order-more-options";

interface OrderPageProps {
  orderId: string;
}

export default function OrderPage({ orderId }: OrderPageProps) {
  const moreOptions = useDisclosure();

  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const { data: order } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      return api.orders.getOrder({ orderId }).then((res) => res.order);
    },
  });

  return (
    <>
      <OrderMoreOptions {...moreOptions} />
      <AppLayout
        title={`Pedido #000${order?.position ?? 0}`}
        description={`Cliente ${order?.customer.name ?? "..."}`}
        goBack={"/"}
        isOverlayed={moreOptions.isOpen}
        footer={
          <div className="grid gap-2.5">
            <Button size={"lg"} className="rounded-full" variant={"outline"}>
              <DownloadIcon className="size-5 mr-2" />
              <span>Baixar Pedido</span>
            </Button>
            <Button
              size={"lg"}
              className="rounded-full"
              variant={"secondary"}
              onClick={moreOptions.onOpen}
            >
              <EllipsisIcon className="size-5 mr-2" />
              <span>Mais Opções</span>
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Total",
                value: formatCurrency(order?.amountTotal ?? 0),
              },
              { label: "Status", value: order?.status ?? "..." },
            ].map((info) => (
              <div key={info.label} className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">{info.label}</h3>
                <span className="text-sm text-muted-foreground">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols gap-2">
            <Description
              title={"Data de Criação"}
              description={order ? formatDate(order?.createdAt) : "..."}
            />
          </div>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col">
          <ListOrderItems items={order?.items ?? []} />
        </div>
      </AppLayout>
    </>
  );
}
