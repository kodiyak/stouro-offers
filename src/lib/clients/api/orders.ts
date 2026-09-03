import { toFormData } from "axios";
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

export async function complete({ orderId }: { orderId: string }) {
  return http
    .post<{ order: Api.Order }>(`/orders/${orderId}/complete`)
    .then((res) => res.data);
}

export async function restore({ orderId }: { orderId: string }) {
  return http
    .post<{ order: Api.Order }>(`/orders/${orderId}/restore`)
    .then((res) => res.data);
}

export async function addManifest(data: { orderId: string; file: File }) {
  return http
    .post<{
      success: boolean;
      manifest: Api.Manifest;
      order: Api.Order;
      addedItems: number;
      createdProducts: number;
    }>(`/orders/${data.orderId}/manifests`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export async function mergeItems(data: {
  orderId: string;
  itemId: string;
  itemIds: string[];
}) {
  return http
    .post<{ order: Api.Order }>(`/orders/${data.orderId}/items/merge`, {
      itemId: data.itemId,
      itemIds: data.itemIds,
    })
    .then((res) => res.data);
}

export async function updateItem(data: {
  orderId: string;
  itemId: string;
  name?: string;
  quantity: number;
  price: number; // em centavos
}) {
  return http
    .patch<{ order: Api.Order }>(
      `/orders/${data.orderId}/items/${data.itemId}`,
      {
        name: data.name,
        quantity: data.quantity,
        price: data.price,
      },
    )
    .then((res) => res.data);
}

export async function deleteItem(data: { orderId: string; itemId: string }) {
  return http
    .delete<{ order: Api.Order }>(
      `/orders/${data.orderId}/items/${data.itemId}`,
    )
    .then((res) => res.data);
}
