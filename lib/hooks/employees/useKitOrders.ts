import {
  GetKitOrdersParams,
  GetKitOrdersResponse,
} from "@/pages/api/clinical/kits/order";
import useSWR, { KeyedMutator } from "swr";

export function useKitOrders({
  filters,
  search,
  sortBy,
  page,
  pageSize,
  organizationId,
}: GetKitOrdersParams = {}): {
  kitOrders: GetKitOrdersResponse["kitOrders"];
  totalKitOrders: GetKitOrdersResponse["totalKitOrders"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetKitOrdersResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  organizationId &&
    params.append("organizationId", encodeURIComponent(organizationId));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));
  sortBy && params.append("sortBy", String(sortBy));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/clinical/kits/order${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      keepPreviousData: true,
    }
  );

  return {
    kitOrders: data?.kitOrders || [],
    totalKitOrders: data?.totalKitOrders || 0,
    isLoading,
    error,
    mutate,
  };
}
