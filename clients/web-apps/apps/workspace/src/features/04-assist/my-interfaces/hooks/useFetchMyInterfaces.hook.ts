import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { getMyUis } from "../apis/my-interfaces-apis";
import { MY_INTERFACES_KEY } from "../constants";

/**
 * Fetches the published UI builder projects assigned to the current user.
 */
export const useFetchMyInterfaces = () => {
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...MY_INTERFACES_KEY, currentSpace?.id],
    queryFn: getMyUis,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
