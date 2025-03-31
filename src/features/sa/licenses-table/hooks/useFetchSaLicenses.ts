import { useEffect } from 'react';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';

import { getSaLicenses } from '../apis/saLicenses-table-apis';
import { DATA_QUERY_KEY } from '../constants';

/**
 * Custom hook to fetch licenses using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchSaLicenses = () => {
  // Get licenses using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getSaLicenses(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
