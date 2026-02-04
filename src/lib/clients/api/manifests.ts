import { toFormData } from "axios";
import { http } from "./utils";

export async function upload(data: { file: File }) {
  return http
    .post<{ success: boolean; path?: string }>(`/manifests`, toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
}
