import { useQuery } from "@tanstack/react-query";
import { getSearchModels } from "../apis/search-model-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchModelsList = (query: string) => {
  return useQuery({
    queryKey: ["models-list", query],
    queryFn: () => getSearchModels(query),
    enabled: !!query,
  });
};
