import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { findMachinesByKeyword } from "../apis/machines-table-apis";

/**
 * Searches machines by name; an empty query fetches nothing.
 */
export const useSearchMachinesList = (query: string) => {
  return useQuery({
    queryKey: ["machines-list", query],
    queryFn: () => findMachinesByKeyword(query),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });
};
