import type { Api } from "@/lib/clients/api/types";
import OrderItemRow from "./order-item-row";

interface ListOrderItemsProps {
  items: Api.OrderItem[];
  orderId: string;
  customerId: string;
  editable?: boolean;
}

export default function ListOrderItems({
  items,
  orderId,
  customerId,
  editable = false,
}: ListOrderItemsProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <OrderItemRow
          key={item.id}
          item={item}
          orderId={orderId}
          customerId={customerId}
          editable={editable}
        />
      ))}
    </div>
  );
}
