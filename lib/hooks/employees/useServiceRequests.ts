import {
  GetServiceRequestParams,
  GetServiceRequestResponse,
} from "@/pages/api/clinical/service/order";
import useSWR, { KeyedMutator } from "swr";

export function useServiceRequest({
  filters,
  search,
  sortBy,
  page,
  pageSize,
  organizationId,
}: GetServiceRequestParams = {}): {
  serviceRequest: GetServiceRequestResponse["services"];
  totalServiceRequest: GetServiceRequestResponse["totalServices"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetServiceRequestResponse>;
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
    `/api/clinical/service/order${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      keepPreviousData: true,
    }
  );

  return {
    serviceRequest: data?.serviceRequest || [],
    totalServiceRequest: data?.totalServiceRequest || 0,
    isLoading,
    error,
    mutate,
  };
}
