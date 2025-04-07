import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

import { getTenantsToSelect } from "../apis/tenants";
import { ISelectOption } from "../types/select-option";

/**
 * Custom hook to fetch tenants to select using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchTenantsToSelect = (isRequired: boolean) => {
  // Get licenses using react query
  const { data, isFetching, refetch, isLoading, isError, error } = useQuery({
    queryKey: ["tenants-to-select"],
    queryFn: () => getTenantsToSelect(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  const defaultSelectOption: ISelectOption[] = [
    {
      label: "Default",
      value: "default",
      disable: true,
    },
  ];

  const selectOptions = isRequired
    ? data?.data
    : defaultSelectOption.concat(data?.data ?? []);

  // Return isFetching and isLoading flag
  return { selectOptions, isFetching, refetch, isLoading };
};
