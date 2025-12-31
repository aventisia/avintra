import { useQuery } from "@tanstack/react-query";

import { getSearchModel } from "../../apis/export-service-apis";

/**
 * Custom hook to fetch models list using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchModelsList = (query: string) => {
  return useQuery({
    queryKey: ["models-list", query],
    queryFn: () => getSearchModel(query),
    enabled: !!query,
  });
};
