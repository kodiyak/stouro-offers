"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/clients/api";
import ListOrderItems from "./list-order-items";

interface OrderPageProps {
  orderId: string;
}

export default function OrderPage({ orderId }: OrderPageProps) {
  const { data: order } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      return api.orders.getOrder({ orderId }).then((res) => res.order);
    },
  });

  return (
    <div className="flex flex-col">
      <ListOrderItems items={order?.items ?? []} />
    </div>
  );
}
