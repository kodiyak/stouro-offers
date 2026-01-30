import { CardTitle } from "@/components/ui/card";
import type { Api } from "@/lib/clients/api/types";
import OrderItemCard from "./order-item-card";

interface ListOrderItemsProps {
  items: Api.OrderItem[];
}

export default function ListOrderItems({ items }: ListOrderItemsProps) {
  return (
    <div className="flex flex-col gap-2">
      <CardTitle>{items.length} itens</CardTitle>
      {items.map((item) => (
        <OrderItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
