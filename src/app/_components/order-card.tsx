import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Description } from "@/components/ui/description";
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
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Pedido #000{order.position}</CardTitle>
        <CardDescription>
          Criado em {formatDate(order.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-background p-4 rounded-lg border-t">
        <div className="grid grid-cols-1 gap-4">
          <Description title={"Cliente"} description={order.customer.name} />
          <Description
            title={"Valor do Pedido"}
            description={`${formatCurrency(order.amountTotal)}`}
          />
          <Description
            title={"Itens no Pedido"}
            description={[
              quantity,
              quantity === 1 ? "peça" : "peças",
              `(${order.items.length}`,
              order.items.length === 1 ? "tipo)" : "tipos)",
            ].join(" ")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
