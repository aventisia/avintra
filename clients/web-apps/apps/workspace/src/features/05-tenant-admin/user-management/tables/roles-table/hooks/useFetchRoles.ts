import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getRoles } from "../apis/roles-table-apis";
import { DATA_QUERY_KEY } from "../constants";

export const useFetchRoles = () => {
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getRoles(),
  });

  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  return { data, isFetching, isLoading };
};
