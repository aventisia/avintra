import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMyUiView } from "../apis/my-interfaces-apis";
import { MY_INTERFACES_KEY } from "../constants";

/**
 * Fetches a published UI builder project and its pinned published version for an assigned user.
 */
export const useFetchMyInterfaceView = (id: string) => {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: [...MY_INTERFACES_KEY, "view", id],
    queryFn: () => getMyUiView(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isError };
};
