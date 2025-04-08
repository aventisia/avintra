import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

import { getRoleRoles } from "../apis/roles-table-apis";

/**
 * Custom hook to fetch role roles using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchRoleRoles = () => {
  // Get roles using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["roles-to-select"],
    queryFn: () => getRoleRoles(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
