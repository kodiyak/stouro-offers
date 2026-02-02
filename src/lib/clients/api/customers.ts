import type { Api } from "./types";
import { http } from "./utils";

export async function getCustomers() {
  return http
    .get<{ customers: Api.Customer[] }>("/customers")
    .then((res) => res.data);
}

export async function getCustomer({ customerId }: { customerId: string }) {
  return http
    .get<{ customer: Api.Customer }>(`/customers/${customerId}`)
    .then((res) => res.data);
}

export async function getProducts({ customerId }: { customerId: string }) {
  return http
    .get<{ products: Api.Product[] }>(`/customers/${customerId}/products`)
    .then((res) => res.data);
}
export async function addProduct(data: {
  customerId: string;
  name: string;
  price: number;
}) {
  return http
    .post<{ product: Api.Product }>(`/products`, data)
    .then((res) => res.data);
}

export async function create(data: { name: string; color: string }) {
  return http
    .post<{ customer: Api.Customer }>(`/customers`, data)
    .then((res) => res.data);
}
