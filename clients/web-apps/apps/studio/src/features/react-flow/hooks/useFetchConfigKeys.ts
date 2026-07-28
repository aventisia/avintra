import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { fetchConfigKeyValuePairs } from "../apis/config-store-apis";

/**
 * Custom hook to fetch keystores using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchConfigKeys = () => {
  // Get keystores using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["KEYSTORE"],
    queryFn: () => fetchConfigKeyValuePairs(),
  });

  // Get ReactFlowExt store state & actions
  const { setConfigVariables } = useReactFlowExtStore(
    useShallow((state) => ({
      setConfigVariables: state.setConfigVariables,
    })),
  );

  useEffect(() => {
    if (data?.data.length) {
      const variables = data.data.map((v) => v.key);

      setConfigVariables(variables);
    }
  }, [data?.data, setConfigVariables]);

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
