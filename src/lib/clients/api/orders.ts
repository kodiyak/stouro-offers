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

export async function cancel({ orderId }: { orderId: string }) {
  return http
    .post<{ order: Api.Order }>(`/orders/${orderId}/cancel`)
    .then((res) => res.data);
}

export async function paid({ orderId }: { orderId: string }) {
  return http
    .post<{ order: Api.Order }>(`/orders/${orderId}/paid`)
    .then((res) => res.data);
}

export async function restore({ orderId }: { orderId: string }) {
  return http
    .post<{ order: Api.Order }>(`/orders/${orderId}/restore`)
    .then((res) => res.data);
}
