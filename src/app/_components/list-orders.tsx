"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/clients/api";
import OrderCard from "./order-card";

export default function ListOrders() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return api.orders.getOrders().then((res) => res.orders);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`}>
          <OrderCard order={order} />
        </Link>
      ))}
    </div>
  );
}
