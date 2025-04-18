import { useEffect } from "react";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";

import { getLicenseDetails, getLicensesToSelect } from "../apis/licenses";

/**
 * Custom hook to fetch licenses to select using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchLicensesToSelect = () => {
  // Get licenses using react query
  const { data, isFetching, refetch, isLoading, isError, error } = useQuery({
    queryKey: ["licenses-to-select"],
    queryFn: () => getLicensesToSelect(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, refetch, isLoading };
};

/**
 * Custom hook to fetch license details using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchLicenseDetails = (id?: string) => {
  // Get licenses using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: ["licenses-details", id ?? ""],
    queryFn: () => getLicenseDetails(id),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
