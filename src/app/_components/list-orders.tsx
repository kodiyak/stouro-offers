"use client";

import { useQuery } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import EmptyOrders from "@/components/empty/empty-orders";
import SkeletonOrders from "@/components/skeletons/skeleton-orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/clients/api";
import type { OrderStatus } from "@/lib/enums";
import { useDateFormatter, useLabelColors, useLabels } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import OrderCard from "./order-card";

const STATUSES: OrderStatus[] = ["DRAFT", "COMPLETED", "PAID", "CANCELLED"];

export default function ListOrders() {
  const { formatDate } = useDateFormatter();
  const labels = useLabels();
  const { ORDER_STATUS: ORDER_STATUS_COLOR } = useLabelColors();
  const { data: orders = [], isPending } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      return api.orders.getOrders().then((res) => res.orders);
    },
  });

  const [tab, setTab] = useState<OrderStatus>("DRAFT");

  const counts = useMemo(
    () => ({
      DRAFT: orders.filter((order) => order.status === "DRAFT").length,
      COMPLETED: orders.filter((order) => order.status === "COMPLETED").length,
      PAID: orders.filter((order) => order.status === "PAID").length,
      CANCELLED: orders.filter((order) => order.status === "CANCELLED").length,
    }),
    [orders],
  );

  const groupedOrders = useMemo(() => {
    const filtered = orders.filter((order) => order.status === tab);
    const groups: Record<string, typeof orders> = {};
    filtered.forEach((order) => {
      const date = startOfDay(new Date(order.createdAt)).toISOString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });

    return Object.entries(groups);
  }, [orders, tab]);

  if (isPending) {
    return <SkeletonOrders />;
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as OrderStatus)}
      className="w-full"
    >
      <TabsList className="bg-transparent w-full">
        {STATUSES.map((status) => (
          <TabsTrigger
            key={status}
            value={status}
            className="px-0 data-[state=active]:bg-muted"
          >
            {labels.ORDER_STATUS[status]}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-bold",
                ORDER_STATUS_COLOR[status],
              )}
            >
              {counts[status]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={tab} className="px-6">
        {groupedOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
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
        )}
      </TabsContent>
    </Tabs>
  );
}
