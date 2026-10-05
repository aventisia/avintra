import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useEnvironmentStore } from "@/stores/environment-store";

import { getSkillById } from "../apis/skill-registry.apis";
import { DETAIL_DATA_QUERY_KEY } from "../constants";

/**
 * Custom hook to fetch a single skill by its ID using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSkillById = (skillId: string) => {
  const env = useEnvironmentStore((state) => state.env);

  // Get the skill by id. The "SKILL" segment keeps this key distinct from the
  // skill files query while staying under the DETAIL_DATA_QUERY_KEY prefix so
  // file mutations refresh both.
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DETAIL_DATA_QUERY_KEY, skillId, "SKILL", env],
    queryFn: () => getSkillById(skillId),
    enabled: Boolean(skillId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
