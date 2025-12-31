import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getPricingPlan } from "../apis/pricingPlans-table-apis";

export const useFetchPricingPlanDetails = (id?: string) => {
  // Get licenses using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["pricing-plan-details", id ?? ""],
    queryFn: () => getPricingPlan(id),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
