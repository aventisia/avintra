import { useQuery } from "@tanstack/react-query";

import { getTemplateById } from "../apis/prompt-template-apis";

/**
 * Custom hook to fetch template details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTemplateDetails = (id: string) => {
  // Get template details using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["PROMPT_TEMPLATE", id],
    queryFn: () => getTemplateById(id),
    enabled: !!id,
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
