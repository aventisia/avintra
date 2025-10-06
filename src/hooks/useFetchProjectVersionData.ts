import { getMLModelVersionById } from "@/features/model-versions/apis/model-version-apis";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook to fetch meta data of ai-project using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchProjectVersionData = () => {
  // Get project id (pid) from query params
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("pid") || "";
  const versionId = searchParams.get("v") || "";

  // Get project meta data using react query
  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["project_version", projectId, versionId],
    queryFn: () => getMLModelVersionById(versionId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return data and refetch
  return { data, refetch, isLoading };
};
