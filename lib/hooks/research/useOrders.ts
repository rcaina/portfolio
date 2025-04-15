import {
  GetResearchOrdersParams,
  GetResearchOrdersResponse,
} from "@/pages/api/research/order";
import useSWR, { KeyedMutator } from "swr";

import { ensureArray } from "@/lib/utils";

export function useOrders({
  filters,
  projectIds,
  search,
  page,
  pageSize,
}: GetResearchOrdersParams = {}): {
  orders: GetResearchOrdersResponse["orders"];
  totalOrders: GetResearchOrdersResponse["totalOrders"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetResearchOrdersResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));
  projectIds &&
    ensureArray(projectIds).forEach((projectId) =>
      params.append("projectIds", String(projectId))
    );

  const { data, error, isLoading, mutate } = useSWR(
    `/api/research/order${params.toString() ? `?${params.toString()}` : ""}`,
    {
      keepPreviousData: true,
    }
  );

  return {
    orders: data?.orders || [],
    totalOrders: data?.totalOrders || 0,
    isLoading,
    error,
    mutate,
  };
}
