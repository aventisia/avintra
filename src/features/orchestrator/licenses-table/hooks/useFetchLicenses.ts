import { useEffect } from 'react';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';

import { getLicenses } from '../apis/licenses-table-apis';
import { DATA_QUERY_KEY } from '../constants';

/**
 * Custom hook to fetch licenses using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchLicenses = () => {
  // Get licenses using react query
  const { data, isFetching, isLoading, isError, error } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getLicenses(),
  });

  // Show toast on fetch error
  useEffect(() => {
    if (isError) toast.error(error.toString());
  }, [error, isError]);

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
