import type { Api } from "@/lib/clients/api/types";
import OrderItemCard from "./order-item-card";

interface ListOrderItemsProps {
  items: Api.OrderItem[];
}

export default function ListOrderItems({ items }: ListOrderItemsProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <OrderItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
