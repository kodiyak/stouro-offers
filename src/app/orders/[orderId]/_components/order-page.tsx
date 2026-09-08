"use client";

import { useQuery } from "@tanstack/react-query";
import { EllipsisIcon, PlusIcon } from "lucide-react";
import AppLayout from "@/components/layouts/app-layout";
import SkeletonOrder from "@/components/skeletons/skeleton-order";
import { Badge } from "@/components/ui/badge";
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
  const { data: order, isPending } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      return api.orders.getOrder({ orderId }).then((res) => res.order);
    },
  });

  const isEditable = order?.status === "DRAFT";

  if (isPending && !order) {
    return <SkeletonOrder />;
  }

  return (
    <>
      {order && <OrderMoreOptions order={order} {...moreOptions} />}
      {order && <AddManifestDrawer orderId={orderId} {...addManifest} />}
      <AppLayout
        title={`Pedido ${order ? `#${order.orderNumber}` : "..."}`}
        description={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {order?.customer.name ?? "..."}
            </span>
            <Badge className="ml-auto" variant={"secondary"}>
              {labels.ORDER_STATUS[order?.status ?? "DRAFT"].toUpperCase()}
            </Badge>
          </div>
        }
        goBack={"/"}
        footer={
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm text-muted-foreground font-mono font-bold">
                Total
              </span>
              <span className="text-3xl font-extrabold font-mono text-right">
                {order ? formatCurrency(order.amountTotal) : "..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {order && (
                <DownloadOrderPdfButton key={order?.updatedAt} order={order} />
              )}
              <Button
                size={"icon-lg"}
                className="rounded-full"
                variant={"secondary"}
                onClick={moreOptions.onOpen}
              >
                <EllipsisIcon />
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col">
          {order && (
            <ListOrderItems
              items={order.items.filter((item) => item.quantity > 0)}
              orderId={orderId}
              customerId={order.customerId}
              editable={isEditable}
            />
          )}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2">
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
        <Separator className="my-8" />
        <div className="grid grid-cols gap-2">
          <Description
            title={"Data de Criação"}
            description={order ? formatDate(order?.createdAt) : "..."}
          />
        </div>
      </AppLayout>
    </>
  );
}
