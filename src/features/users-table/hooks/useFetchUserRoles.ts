import { getUserRoles } from "@/features/users-table";
import { useQuery } from "@tanstack/react-query";

/**
 * Custom hook to fetch user roles using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUserRoles = () => {
  // Get users using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["roles-to-select"],
    queryFn: () => getUserRoles(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
