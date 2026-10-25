import { toast } from "@avplatform/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { getCreditUsageSummary } from "../apis/credit-usage-apis";
import { useDateRangePickerStore } from "../store/date-range-store";
import { useSpaceFilterStore } from "../store/space-filter-store";

/**
 * Custom hook to fetch credit usage summary using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchCreditUsageSummary = () => {
  const { dateRange } = useDateRangePickerStore();
  const { allSpaceIds, selectedSpaceIds, centralSpaceId } = useSpaceFilterStore(
    useShallow((s) => ({
      allSpaceIds: s.allSpaceIds,
      selectedSpaceIds: s.selectedSpaceIds,
      centralSpaceId: s.centralSpaceId,
    })),
  );

  const from = format(dateRange?.from || "", "yyyy-MM-dd");
  const to = format(dateRange?.to || "", "yyyy-MM-dd");

  // Derive API filter params from the selected space set.
  // When every available space is selected, no filtering is needed.
  const allSelected =
    allSpaceIds.length > 0 &&
    allSpaceIds.length === selectedSpaceIds.length &&
    allSpaceIds.every((id) => selectedSpaceIds.includes(id));
  const filterBySpaces = !allSelected;
  // Central is represented by the centralSpaceId option; everything else maps to a real SpaceId.
  const spaceIds = selectedSpaceIds.filter((id) => id !== centralSpaceId);
  const includeCentral = selectedSpaceIds.includes(centralSpaceId ?? "");

  // Get credit usage summary using react query
  const { data, isFetching, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["CREDIT_USAGE_SUMMARY", from, to, filterBySpaces, includeCentral, spaceIds],
    queryFn: () => getCreditUsageSummary(from, to, filterBySpaces, spaceIds, includeCentral),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading, refetch };
};
