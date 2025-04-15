import {
  GetSpecimenParams,
  GetSpecimenResponse,
} from "@/pages/api/research/specimen";
import useSWR, { KeyedMutator } from "swr";

import { ensureArray } from "@/lib/utils";

export function useSpecimens({
  filters,
  search,
  page,
  pageSize,
  orderId,
  projectIds,
}: GetSpecimenParams = {}): {
  specimens: GetSpecimenResponse["specimens"];
  totalSpecimens: GetSpecimenResponse["totalSpecimens"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetSpecimenResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));
  orderId && params.append("orderId", String(orderId));
  projectIds &&
    ensureArray(projectIds).forEach((projectId) =>
      params.append("projectIds", String(projectId))
    );

  const { data, error, isLoading, mutate } = useSWR(
    `/api/research/specimen${params.toString() ? `?${params.toString()}` : ""}`,
    {
      keepPreviousData: true,
    }
  );

  return {
    specimens: data?.specimens || [],
    totalSpecimens: data?.totalSpecimens || 0,
    isLoading,
    error,
    mutate,
  };
}
