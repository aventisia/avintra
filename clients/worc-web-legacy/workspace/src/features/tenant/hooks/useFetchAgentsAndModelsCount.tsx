import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAgentsCount } from "../apis/tenant-info-apis";

export const useFetchAgentsAndModelsCount = () => {
  const agentsQuery = useQuery({
    queryKey: ["AGENTS_COUNT"],
    queryFn: getAgentsCount,
  });

  // ---- Combined loading / fetching ----
  const isLoading = agentsQuery.isLoading;
  const isFetching = agentsQuery.isFetching;

  // ---- Error handling ----
  useEffect(() => {
    if (agentsQuery.isError) toast.error(String(agentsQuery.error));
    // if (modelsQuery.isError) toast.error(String(modelsQuery.error));
  }, [
    agentsQuery.isError,
    agentsQuery.error,
    // modelsQuery.isError,
    // modelsQuery.error,
  ]);

  return {
    // totalCount,
    agentsCount: agentsQuery.data?.data ?? 0,
    // modelsCount: modelsQuery.data ?? 0,
    isLoading,
    isFetching,
  };
};
