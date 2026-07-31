import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getCredSelectOptions } from "@/features/02-configure/queues/queues-table/apis/app-secret-apis";
import { CredSelectDto } from "@/features/02-configure/queues/queues-table/dtos/cred-select-dto.ts.ts";

import { DATA_QUERY_KEY } from "../constants/tools-table.constants";

/**
 * Fetches credentials that can be assigned to a tool.
 *
 * Uses the shared app-secret select-options endpoint filtered to
 * CustomApiTool. This keeps the hook isolated in the tools feature.
 */
export const useFetchCustomApiCredentials = () => {
  const { data, isFetching, isLoading, isError } = useQuery({
    queryKey: [...DATA_QUERY_KEY, "credentials", "custom-api-tool"],
    queryFn: () => getCredSelectOptions("CustomApiTool"),
    staleTime: 60 * 1000,
  });

  const credentials = useMemo(() => (data?.data ?? []) as CredSelectDto[], [data]);

  return { data: credentials, isFetching, isLoading, isError };
};
