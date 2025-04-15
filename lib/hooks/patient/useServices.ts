import useSWR, { KeyedMutator } from "swr";

import {
  GetSpecimenParams,
  GetSpecimenResponse,
} from "@/pages/api/clinical/specimen";

export function useServices({
  filters,
  search,
  page,
  pageSize,
  patientId,
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
  patientId && params.append("patientId", encodeURIComponent(patientId));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/clinical/specimen${params.toString() ? `?${params.toString()}` : ""}`,
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
