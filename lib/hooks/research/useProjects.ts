import {
  GetResearchProjectsParams,
  GetResearchProjectsResponse,
} from "@/pages/api/research/project";
import useSWR, { KeyedMutator } from "swr";

export function useProjects({
  filters,
  search,
  page,
  pageSize,
}: GetResearchProjectsParams = {}): {
  projects: GetResearchProjectsResponse["projects"];
  totalProjects: GetResearchProjectsResponse["totalProjects"];
  isLoading: boolean;
  error: unknown;
  mutate: KeyedMutator<GetResearchProjectsResponse>;
} {
  const params = new URLSearchParams();
  filters &&
    filters.forEach((filter) => params.append("filters", String(filter)));
  search && params.append("search", encodeURIComponent(search));
  page && params.append("page", String(page));
  pageSize && params.append("pageSize", String(pageSize));

  const { data, error, isLoading, mutate } = useSWR(
    `/api/research/project${params.toString() ? `?${params.toString()}` : ""}`,
    {
      keepPreviousData: true,
    }
  );

  return {
    projects: data?.projects || [],
    totalProjects: data?.totalProjects || 0,
    isLoading,
    error,
    mutate,
  };
}
