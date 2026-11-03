import { useQuery } from "@tanstack/react-query";

import { getToolById } from "../apis/tools.apis";
import { DETAIL_DATA_QUERY_KEY } from "../constants/tools-table.constants";

/**
 * Fetches one tool with its parsed operations; refreshed when the tool wizard saves.
 */
export const useFetchToolDetails = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [...DETAIL_DATA_QUERY_KEY, id],
    queryFn: () => getToolById(id),
    enabled: !!id,
  });

  return { tool: data?.data, isLoading };
};
