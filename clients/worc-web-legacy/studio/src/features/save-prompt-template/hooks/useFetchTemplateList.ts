import { useQuery } from "@tanstack/react-query";

import { getTemplatesList } from "../apis/prompt-template-apis";

/**
 * Custom hook to fetch template list using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTemplateList = () => {
  // Get template details using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["PROMPT_TEMPLATES"],
    queryFn: () => getTemplatesList("Prompt"),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
