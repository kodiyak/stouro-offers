"use client";

import { useQuery } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { api } from "@/lib/clients/api";
import { useDateFormatter } from "@/lib/hooks";
import OrderCard from "./order-card";

export default function ListOrders() {
  const { formatDate } = useDateFormatter();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return api.orders.getOrders().then((res) => res.orders);
    },
  });

  const groupedOrders = useMemo(() => {
    const groups: Record<string, typeof orders> = {};
    orders.forEach((order) => {
      const date = startOfDay(new Date(order.createdAt)).toISOString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });

    return Object.entries(groups);
  }, [orders]);

  return (
    <div className="flex flex-col gap-8">
      {groupedOrders.map(([date, orders]) => (
        <div className="flex flex-col gap-2" key={date}>
          <span className="text-sm font-bold text-muted-foreground">
            {formatDate(date, "PP")}
          </span>
          <div className="flex flex-col gap-2">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <OrderCard order={order} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
