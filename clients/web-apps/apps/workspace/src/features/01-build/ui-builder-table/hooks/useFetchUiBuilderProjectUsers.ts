import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getUiBuilderProjectUsers } from "../apis/ui-builder-users-apis";
import { UI_BUILDER_USER_KEY } from "../constants";

/**
 * Fetches the users assigned to a UI builder project.
 */
export const useFetchUiBuilderProjectUsers = (uiBuilderProjectId: string) => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [UI_BUILDER_USER_KEY, uiBuilderProjectId],
    queryFn: () => getUiBuilderProjectUsers(uiBuilderProjectId),
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
