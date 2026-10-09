import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { fetchConfigKeyValuePairs } from "../apis/config-store-apis";

/**
 * Fetches key store entries for the currently loaded flow's space.
 */
export const useFetchConfigKeys = () => {
  const { spaceId, flowId } = useCurrentFlowStore(
    useShallow((state) => ({
      spaceId: state.currentFlow.spaceId ?? "central",
      flowId: state.currentFlow.id,
    })),
  );

  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["KEYSTORE", spaceId],
    queryFn: () => fetchConfigKeyValuePairs(),
    enabled: !!flowId,
  });

  const { setConfigVariables } = useReactFlowExtStore(
    useShallow((state) => ({
      setConfigVariables: state.setConfigVariables,
    })),
  );

  useEffect(() => {
    const variables = data?.data?.map((v) => v.key) ?? [];

    setConfigVariables(variables);
  }, [data?.data, setConfigVariables]);

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
