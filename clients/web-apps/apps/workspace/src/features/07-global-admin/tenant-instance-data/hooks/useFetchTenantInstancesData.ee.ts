import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getTenantInstancesData } from "../apis/tenant-instance-data-apis.ee";
import { INSTANCE_DATA_QUERY_KEY } from "../constants";
import { useDateRangePickerStore } from "../date-range-store.ee";

/**
 * Custom hook to fetch OnPremTenantInstances data using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantInstancesData = (id: string) => {
  const { dateRange } = useDateRangePickerStore(
    useShallow((state) => ({ dateRange: state.dateRange })),
  );
  // Get OnPremTenantInstances data using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [INSTANCE_DATA_QUERY_KEY, id],
    queryFn: () =>
      getTenantInstancesData(
        id,
        format(dateRange?.from || "", "yyyy-MM-dd"),
        format(dateRange?.to || "", "yyyy-MM-dd"),
      ),
    enabled: !!id,
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
