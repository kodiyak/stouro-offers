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
