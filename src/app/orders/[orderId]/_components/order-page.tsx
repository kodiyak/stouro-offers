"use client";

import { useQuery } from "@tanstack/react-query";
import { EllipsisIcon, PlusIcon } from "lucide-react";
import AppLayout from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Description } from "@/components/ui/description";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/clients/api";
import {
  useCurrencyFormatter,
  useDateFormatter,
  useDisclosure,
  useLabels,
} from "@/lib/hooks";
import AddManifestDrawer from "./add-manifest-drawer";
import DownloadOrderPdfButton from "./download-order-pdf-button";
import ListManifests from "./list-manifests";
import ListOrderItems from "./list-order-items";
import OrderMoreOptions from "./order-more-options";

interface OrderPageProps {
  orderId: string;
}

export default function OrderPage({ orderId }: OrderPageProps) {
  const moreOptions = useDisclosure();
  const addManifest = useDisclosure();

  const labels = useLabels();

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
      {order && <OrderMoreOptions order={order} {...moreOptions} />}
      {order && <AddManifestDrawer orderId={orderId} {...addManifest} />}
      <AppLayout
        title={`Pedido ${order ? `#${order.orderNumber}` : "..."}`}
        description={order?.customer.name ?? "..."}
        goBack={"/"}
        isOverlayed={moreOptions.isOpen}
        footer={
          <div className="grid gap-2.5">
            {order && <DownloadOrderPdfButton order={order} />}
            <Button
              size={"drawer"}
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
              {
                label: "Status",
                value: order?.status
                  ? labels.ORDER_STATUS[order.status].toUpperCase()
                  : "...",
              },
            ].map((info) => (
              <div key={info.label} className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">{info.label}</h3>
                <span className="text-sm text-muted-foreground">
                  {info.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col my-6">
          <ListOrderItems
            items={(order?.items ?? []).filter((item) => item.quantity > 0)}
          />
        </div>
        <div className="flex flex-col gap-2 my-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Romaneios</h3>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={addManifest.onOpen}
            >
              <PlusIcon className="size-4" />
              <span>Adicionar</span>
            </Button>
          </div>
          <ListManifests manifests={order?.manifests ?? []} />
        </div>
        <Separator />
        <div className="grid grid-cols gap-2 my-6">
          <Description
            title={"Data de Criação"}
            description={order ? formatDate(order?.createdAt) : "..."}
          />
        </div>
      </AppLayout>
    </>
  );
}
