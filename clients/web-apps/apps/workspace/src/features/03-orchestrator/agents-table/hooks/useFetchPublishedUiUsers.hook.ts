import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getPublishedUiUsers } from "../apis/published-uis-apis";
import { PUBLISHED_UI_USER_KEY } from "../constants";

/**
 * Fetches the users assigned to a published UI builder project.
 */
export const useFetchPublishedUiUsers = (uiBuilderProjectId: string) => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [PUBLISHED_UI_USER_KEY, uiBuilderProjectId],
    queryFn: () => getPublishedUiUsers(uiBuilderProjectId),
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
