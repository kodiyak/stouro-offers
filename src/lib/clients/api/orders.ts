import type { Api } from "./types";
import { http } from "./utils";

export async function create(data: {
  customerId: string;
  products: Record<string, number>;
}) {
  return http
    .post<{ order: Api.Order }>("/orders", data)
    .then((res) => res.data);
}

export async function getOrders() {
  return http.get<{ orders: Api.Order[] }>("/orders").then((res) => res.data);
}

export async function getOrder({ orderId }: { orderId: string }) {
  return http
    .get<{ order: Api.Order }>(`/orders/${orderId}`)
    .then((res) => res.data);
}
