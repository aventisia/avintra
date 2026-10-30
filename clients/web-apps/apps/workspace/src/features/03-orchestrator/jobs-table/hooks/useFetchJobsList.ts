import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, subDays } from "date-fns";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useCurrentSpaceStore } from "@/stores/current-space-store";

import { DATA_QUERY_KEY, getJobs, useDateRangePickerStore } from "..";
import { paramsToRange } from "../utils/date-range-selector-utils";

/**
 * Custom hook to fetch jobs using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchJobsList = () => {
  const [searchParams] = useSearchParams();

  // Get the currently selected space so the query refetches when the space changes
  const { currentSpace } = useCurrentSpaceStore(
    useShallow((state) => ({
      currentSpace: state.currentSpace,
    })),
  );

  const { dateRange } = useDateRangePickerStore(
    useShallow((state) => ({ dateRange: state.dateRange })),
  );

  const isCommunityDeployment = useUserSessionStore(
    (state) => state.userSession?.deploymentType === "Community",
  );
  const isStarterPlan = useUserSessionStore((state) => state.userSession?.planType === "Starter");
  const historyLimitDays = isCommunityDeployment || isStarterPlan ? 1 : undefined;
  const urlRange = paramsToRange(searchParams.get("from"), searchParams.get("to"));
  const today = new Date();
  let effectiveDateRange = urlRange ?? dateRange;

  const earliestReadable = historyLimitDays
    ? subDays(startOfDay(today), historyLimitDays - 1)
    : undefined;
  if (effectiveDateRange?.from && earliestReadable && effectiveDateRange.from < earliestReadable) {
    effectiveDateRange = { from: earliestReadable, to: effectiveDateRange.to };
  }

  const from = format(effectiveDateRange!.from!, "yyyy-MM-dd");
  const to = format(effectiveDateRange!.to!, "yyyy-MM-dd");

  // Get jobs using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: [...DATA_QUERY_KEY, from, to, currentSpace?.id],
    queryFn: () => getJobs(from, to),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
