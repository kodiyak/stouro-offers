"use client";

import { PencilIcon, ShirtIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter, useDisclosure } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import EditOrderItemDrawer from "./edit-order-item-drawer";
import EditProductDrawer from "./edit-product-drawer";

interface OrderItemRowProps {
  orderId: string;
  customerId: string;
  item: Api.OrderItem;
  editable?: boolean;
}

export default function OrderItemRow({
  orderId,
  customerId,
  item,
  editable = false,
}: OrderItemRowProps) {
  const editItem = useDisclosure();
  const editProduct = useDisclosure();
  const { formatCurrency } = useCurrencyFormatter();

  const handleEditProduct = () => {
    editItem.onClose();
    editProduct.onOpen();
  };

  return (
    <>
      <EditOrderItemDrawer
        orderId={orderId}
        item={item}
        onEditProduct={handleEditProduct}
        {...editItem}
      />
      <EditProductDrawer
        customerId={customerId}
        productId={item.productId}
        orderId={orderId}
        itemId={item.id}
        {...editProduct}
      />
      <Card
        className={cn(
          "py-2",
          editable && "cursor-pointer transition-transform active:scale-[0.99]",
        )}
        role={editable ? "button" : undefined}
        tabIndex={editable ? 0 : undefined}
        onClick={editable ? editItem.onOpen : undefined}
        onKeyDown={
          editable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  editItem.onOpen();
                }
              }
            : undefined
        }
      >
        <div className="flex items-center gap-4 px-4">
          <ShirtIcon className="size-6" />
          <div className="flex flex-col flex-1">
            <span className="font-medium">{item.name}</span>
            <span className="text-sm text-muted-foreground">
              {item.quantity} x {formatCurrency(item.price)}
            </span>
          </div>
          <span className="text-xl font-bold">
            {formatCurrency(item.quantity * item.price)}
          </span>
          {editable && <PencilIcon className="size-4 text-muted-foreground" />}
        </div>
      </Card>
    </>
  );
}
