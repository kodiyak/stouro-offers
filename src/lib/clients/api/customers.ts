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

export async function getProducts({
  customerId,
  status,
}: {
  customerId: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
}) {
  return http
    .get<{ products: Api.Product[] }>(`/customers/${customerId}/products`, {
      params: { status },
    })
    .then((res) => res.data);
}

export async function getBeneficiaries({ customerId }: { customerId: string }) {
  return http
    .get<{ beneficiaries: Api.Beneficiary[] }>(
      `/customers/${customerId}/beneficiaries`,
    )
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

export async function updateProduct(data: {
  productId: string;
  name: string;
  price: number; // em centavos
  orderId?: string;
  itemId?: string;
}) {
  return http
    .patch<{ product: Api.Product; order: Api.Order | null }>(
      `/products/${data.productId}`,
      data,
    )
    .then((res) => res.data);
}

export async function archiveProduct({ productId }: { productId: string }) {
  return http
    .post<{ product: Api.Product }>(`/products/${productId}/archive`)
    .then((res) => res.data);
}

export async function restoreProduct({ productId }: { productId: string }) {
  return http
    .post<{ product: Api.Product }>(`/products/${productId}/restore`)
    .then((res) => res.data);
}

export async function create(data: { name: string; color: string }) {
  return http
    .post<{ customer: Api.Customer }>(`/customers`, data)
    .then((res) => res.data);
}

export async function createBeneficiary(data: {
  customerId: string;
  name: string;
}) {
  return http
    .post<{ beneficiary: Api.Beneficiary }>(
      `/customers/${data.customerId}/beneficiaries`,
      { name: data.name },
    )
    .then((res) => res.data);
}
