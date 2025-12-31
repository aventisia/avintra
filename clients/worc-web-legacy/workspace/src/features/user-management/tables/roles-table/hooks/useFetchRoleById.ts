import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getRole } from "../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../constants";

export const useFetchRoleById = (roleID: string) => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [DATA_QUERY_KEY, roleID],
    queryFn: () => getRole(roleID),
    enabled: !!roleID,
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
