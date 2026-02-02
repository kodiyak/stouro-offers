import { DollarSignIcon, HistoryIcon, TrashIcon } from "lucide-react";
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
import type { UseDisclosure } from "@/lib/hooks";
import { useMutationAPI } from "@/lib/hooks";
import { cn, invalidateQueries } from "@/lib/utils";

interface OrderMoreOptionsProps extends UseDisclosure {
  order: Api.Order;
}

export default function OrderMoreOptions({
  isOpen,
  onOpenChange,
  onClose,
  order,
}: OrderMoreOptionsProps) {
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

  const paid = useMutationAPI({
    mutationFn: async () => api.orders.paid({ orderId: order.id }),
    onSuccess: async () => {
      await invalidateQueries(["orders", order.id]);
      onClose();
    },
    toast: {
      loading: () => ({
        title: "Marcando como pago...",
        description: "Processando pagamento do pedido.",
      }),
      success: () => ({
        title: "Pedido marcado como pago!",
        description: "O pedido foi marcado como pago.",
      }),
      error: () => ({
        title: "Erro ao marcar como pago",
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
        description: "O pedido foi cancelado com sucesso.",
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
          {order.status !== "DRAFT" && (
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
              onClick={() => paid.mutateAsync()}
              disabled={paid.isPending}
              size={"drawer"}
              variant={"outline"}
            >
              <DollarSignIcon />
              <span>Marcar como Pago</span>
            </Button>
          )}
          {order.status === "DRAFT" && (
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
