import { http } from "./utils";

export async function create(data: {
  customerId: string;
  products: Record<string, number>;
}) {
  return http.post("/orders", data).then((res) => res.data);
}
