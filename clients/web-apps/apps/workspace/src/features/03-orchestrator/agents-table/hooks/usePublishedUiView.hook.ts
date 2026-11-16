import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getOmUiView } from "../apis/published-uis-apis";

/**
 * Fetches a published UI builder project and its pinned published version.
 */
export const usePublishedUiView = (uiBuilderProjectId: string, enabled: boolean) => {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["published-ui-view", uiBuilderProjectId],
    queryFn: () => getOmUiView(uiBuilderProjectId),
    enabled: enabled && !!uiBuilderProjectId,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching };
};
