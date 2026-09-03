import type { Api } from "./types";
import { http } from "./utils";

export async function getOverview() {
  return http.get<Api.FinancialOverview>("/financial").then((res) => res.data);
}

export async function getActivity({ month }: { month: string }) {
  return http
    .get<Api.FinancialActivity>("/financial/activity", {
      params: { month },
    })
    .then((res) => res.data);
}
