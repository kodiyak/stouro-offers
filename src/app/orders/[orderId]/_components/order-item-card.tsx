import { ShirtIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter } from "@/lib/hooks";

interface OrderItemCardProps {
  item: Api.OrderItem;
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <Card className="py-2">
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
      </div>
    </Card>
  );
}
