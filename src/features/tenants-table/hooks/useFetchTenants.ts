import { getTenants, DATA_QUERY_KEY } from "@/features/tenants-table";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch tenants using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenants = () => {
  // Get tenants using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getTenants(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
