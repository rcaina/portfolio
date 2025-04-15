import useSWR, { KeyedMutator } from "swr";

import { GetPatientsParams, GetPatientsResponse } from "@/pages/api/patient";

export function usePatients({
  filters,
  search,
  page,
  pageSize,
  practitionerId,
}: GetPatientsParams = {}): {
  patients: GetPatientsResponse["patients"];
  totalPatients: GetPatientsResponse["totalPatients"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetPatientsResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  practitionerId &&
    params.append("practitionerId", encodeURIComponent(practitionerId));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/patient${params.toString() ? `?${params.toString()}` : ""}`,
    {
      keepPreviousData: true,
    }
  );

  return {
    patients: data?.patients || [],
    totalPatients: data?.totalPatients || 0,
    isLoading,
    error,
    mutate,
  };
}
