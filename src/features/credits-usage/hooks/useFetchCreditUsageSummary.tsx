import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";

import { getCreditUsageSummary } from "../apis/credit-usage-apis";
import { useDateRangePickerStore } from "../store/date-range-store";

/**
 * Custom hook to fetch credit usage summary using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchCreditUsageSummary = () => {
  const { dateRange } = useDateRangePickerStore();
  // Get credit usage summary using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["CREDIT_USAGE_SUMMARY", dateRange?.from, dateRange?.to],
    queryFn: () =>
      getCreditUsageSummary(
        format(dateRange?.from || "", "yyyy-MM-dd"),
        format(dateRange?.to || "", "yyyy-MM-dd"),
      ),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
