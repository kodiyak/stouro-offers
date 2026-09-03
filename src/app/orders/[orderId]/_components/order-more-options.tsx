import { CheckIcon, HistoryIcon, TrashIcon } from "lucide-react";
import { useOverlayedActive } from "@/components/providers/overlayed-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/lib/clients/api";
import type { Api } from "@/lib/clients/api/types";
import { type UseDisclosure, useDisclosure, useMutationAPI } from "@/lib/hooks";
import { cn, invalidateQueries } from "@/lib/utils";
import CancelOrderDrawer from "./cancel-order-drawer";

interface OrderMoreOptionsProps extends UseDisclosure {
  order: Api.Order;
}

export default function OrderMoreOptions({
  isOpen,
  onOpenChange,
  onClose,
  order,
}: OrderMoreOptionsProps) {
  useOverlayedActive(isOpen);
  const cancelDrawer = useDisclosure();
  const restore = useMutationAPI({
    mutationFn: async () => api.orders.restore({ orderId: order.id }),
    onSuccess: async () => {
      await invalidateQueries(["orders", order.id]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Restaurando pedido...",
        description: "Estamos restaurando o pedido.",
      }),
      success: () => ({
        title: "Pedido restaurado!",
        description: "O pedido foi restaurado com sucesso.",
      }),
      error: () => ({
        title: "Erro ao restaurar pedido",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  const complete = useMutationAPI({
    mutationFn: async () => api.orders.complete({ orderId: order.id }),
    onSuccess: async () => {
      await invalidateQueries(["orders", order.id]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Concluindo pedido...",
        description: "Emitindo a cobrança no extrato do cliente.",
      }),
      success: () => ({
        title: "Pedido concluído!",
        description: "A cobrança foi lançada no extrato do cliente.",
      }),
      error: () => ({
        title: "Erro ao concluir pedido",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  const cancel = useMutationAPI({
    mutationFn: async () => api.orders.cancel({ orderId: order.id }),
    onSuccess: async () => {
      await invalidateQueries(["orders", order.id]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Cancelando pedido...",
        description: "Processando cancelamento do pedido.",
      }),
      success: () => ({
        title: "Pedido cancelado!",
        description:
          order.status === "COMPLETED"
            ? "A cobrança foi estornada do extrato do cliente."
            : "O pedido foi cancelado com sucesso.",
      }),
      error: () => ({
        title: "Erro ao cancelar pedido",
        description: "Tente novamente mais tarde.",
      }),
    },
  });

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Mais Opções</DrawerTitle>
          <DrawerDescription>
            Gerencie mais opções deste pedido aqui.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter
          className={cn(
            "grid",
            order.status === "DRAFT" ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {order.status === "CANCELLED" && (
            <Button
              variant="outline"
              size={"drawer"}
              onClick={() => restore.mutateAsync()}
              disabled={restore.isPending}
            >
              <HistoryIcon />
              <span>Restaurar</span>
            </Button>
          )}
          {order.status === "DRAFT" && (
            <Button
              onClick={() => complete.mutateAsync()}
              disabled={complete.isPending}
              size={"drawer"}
              variant={"outline"}
            >
              <CheckIcon />
              <span>Concluir Pedido</span>
            </Button>
          )}
          {(order.status === "DRAFT" || order.status === "COMPLETED") && (
            <Button
              variant="destructive"
              onClick={() => cancel.mutateAsync()}
              disabled={cancel.isPending}
              size={"drawer"}
            >
              <TrashIcon />
              <span>Cancelar</span>
            </Button>
          )}
          {order.status === "PAID" && (
            <Button
              variant="destructive"
              size={"drawer"}
              onClick={cancelDrawer.onOpen}
            >
              <TrashIcon />
              <span>Cancelar Pedido</span>
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
      <CancelOrderDrawer order={order} {...cancelDrawer} />
    </Drawer>
  );
}
