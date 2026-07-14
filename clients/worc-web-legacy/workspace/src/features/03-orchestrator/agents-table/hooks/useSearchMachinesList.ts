import { useQuery } from "@tanstack/react-query";

import { findMachinesByKeyword } from "../../machines-table/apis/machines-table-apis";

/**
 * Custom hook to fetch flow users using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useSearchMachinesList = (query: string) => {
  return useQuery({
    queryKey: ["machines-list", query],
    queryFn: () => findMachinesByKeyword(query),

    enabled: !!query,
  });
};
