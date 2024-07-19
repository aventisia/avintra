import { useQuery } from "@tanstack/react-query";
import { USER_ROLES_QUERY_KEY } from "../constants/constants";
import { getUserRoles } from "../apis/users-table-apis";

/**
 * Custom hook to fetch user roles using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchUserRoles = () => {
  // Get users using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: USER_ROLES_QUERY_KEY,
    queryFn: () => getUserRoles(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
