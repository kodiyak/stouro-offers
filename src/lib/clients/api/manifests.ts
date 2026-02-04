import { toFormData } from "axios";
import type { Api } from "./types";
import { http } from "./utils";

export async function upload(data: { file: File }) {
  return http
    .post<{ manifestId: string }>(`/manifests`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}

export async function getManifest({ manifestId }: { manifestId: string }) {
  return http
    .get<{ manifest: Api.Manifest }>(`/manifests/${manifestId}`)
    .then((res) => res.data);
}

export async function approve({ manifestId }: { manifestId: string }) {
  return http
    .post<{ manifest: Api.Manifest }>(`/manifests/${manifestId}/approve`)
    .then((res) => res.data);
}

export async function reject({ manifestId }: { manifestId: string }) {
  return http
    .post<{ manifest: Api.Manifest }>(`/manifests/${manifestId}/reject`)
    .then((res) => res.data);
}

export async function setCustomer(data: {
  manifestId: string;
  customerId: string;
}) {
  return http
    .post<{ manifest: Api.Manifest }>(
      `/manifests/${data.manifestId}/customers/${data.customerId}`,
    )
    .then((res) => res.data);
}
