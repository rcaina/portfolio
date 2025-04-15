import useSWR, { SWRResponse } from "swr";

import { getProjectsResponse } from "@/pages/api/filters/projects";

export function useProjects(
  organizationId: string
): SWRResponse<getProjectsResponse> {
  const swrKey = `/api/filters/projects?organizationId=${organizationId}`;
  return useSWR(swrKey);
}
