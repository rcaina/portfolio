import { GetEmployeesParams, GetEmployeesResponse } from "@/pages/api/employee";
import useSWR, { KeyedMutator } from "swr";

export function useEmployees({
  filters,
  search,
  page,
  pageSize,
  organizationId,
  roles,
}: GetEmployeesParams = {}): {
  employees: GetEmployeesResponse["employees"];
  totalEmployees: GetEmployeesResponse["totalEmployees"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetEmployeesResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  roles && roles.forEach((role) => params.append("roles", String(role)));
  organizationId &&
    params.append("organizationId", encodeURIComponent(organizationId));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/employee${params.toString() ? `?${params.toString()}` : ""}`,
    {
      keepPreviousData: true,
    }
  );

  return {
    employees: data?.employees || [],
    totalEmployees: data?.totalEmployees || 0,
    isLoading,
    error,
    mutate,
  };
}
