import { getProjectMetaData } from "@/apis/project-apis";

import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook to fetch meta data of ai-project using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchProjectMetaData = () => {
  // Get project id (pid) from query params
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("pid") || "";

  // Get project meta data using react query
  const { data, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectMetaData(projectId),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return data and refetch
  return { data, refetch, isLoading };
};
