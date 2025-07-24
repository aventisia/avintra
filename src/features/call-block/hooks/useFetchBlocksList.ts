import { useQuery } from "@tanstack/react-query";
import { getSearchBlock } from "../apis/search-block-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchBlocksList = (query: string) => {
  return useQuery({
    queryKey: ["blocks-list", query],
    queryFn: () => getSearchBlock(query),
    enabled: !!query,
  });
};
