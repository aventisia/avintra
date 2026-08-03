import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getTemplateByRefId } from "../apis/save-as-template-apis";

/**
 * Custom hook to fetch template details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTemplateDetails = () => {
  const [searchParams] = useSearchParams();

  const versionId = searchParams.get("v") || "";

  // Get template details using react query
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["PROJECT_TEMPLATE", versionId],
    queryFn: () => getTemplateByRefId(versionId),
    enabled: !!versionId,
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
