import type { Api } from "@/lib/clients/api/types";
import { useCurrencyFormatter, useDateFormatter } from "@/lib/hooks";
import { sumBy } from "@/lib/utils";

interface OrderCardProps {
  order: Api.Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const quantity = sumBy(order.items, (item) => item.quantity);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-card border">
      <div className="flex flex-col flex-1">
        <span className="text-lg font-bold">{order.customer.name}</span>
        <span className="text-xs text-muted-foreground">
          {[
            quantity,
            quantity === 1 ? "peça" : "peças",
            `(${order.items.length}`,
            order.items.length === 1 ? "tipo)" : "tipos)",
          ].join(" ")}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-lg font-bold">
          {formatCurrency(order.amountTotal)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </span>
      </div>
    </div>
  );
}
