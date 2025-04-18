import { useEffect } from "react";
import { toast } from "sonner";

import { getTenantDetails, getTenantsToSelect } from "@/apis/tenants";
import { ISelectOption } from "@/react-toolkit/types/select-option";
import { useQuery } from "@tanstack/react-query";

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
      value: "00000000-0000-0000-0000-000000000000",
      disable: true,
    },
  ];

  const selectOptions = isRequired
    ? data?.data
    : defaultSelectOption.concat(data?.data ?? []);

  // Return isFetching and isLoading flag
  return { selectOptions, isFetching, refetch, isLoading };
};

export const useFetchTenantDetails = (id?: string) => {
  // Get tenant using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["tenant-details", id ?? ""],
    queryFn: () => getTenantDetails(id),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { tenantDetails: data, isFetching, isLoading };
};
