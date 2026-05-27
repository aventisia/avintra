import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getTemplateById } from "../apis/av-platform-templates-apis";

/**
 * Custom hook to fetch template details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTemplateDetails = () => {
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get("t") || "";

  // Get flow versions using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["PROJECT_TEMPLATE", templateId],
    queryFn: () => getTemplateById(templateId),
    enabled: !!templateId,
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
