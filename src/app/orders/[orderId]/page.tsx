import type { NextPage } from "next";
import AppLayout from "@/components/layouts/app-layout";
import OrderPage from "./_components/order-page";

export default async function Page({ params }: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;

  return <OrderPage orderId={orderId} />;
}
