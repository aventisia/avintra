import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSkillFiles } from "../apis/skill-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../constants";
import { useEnvironmentStore } from "@/stores/environment-store";

/**
 * Custom hook to fetch skill files using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkillFiles = (skillId: string) => {
  const env = useEnvironmentStore((state) => state.env);
  // Get skill files using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DETAIL_DATA_QUERY_KEY, skillId, env],
    queryFn: () => getSkillFiles(skillId),
    enabled: Boolean(skillId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
