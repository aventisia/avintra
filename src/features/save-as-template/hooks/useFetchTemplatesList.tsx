import { useQuery } from "@tanstack/react-query";

import { getTemplateList } from "../apis/use-template-apis";

/**
 * Custom hook to fetch templates using react query.
 * @returns An object containing the fetched data, and refetch method.
 */
export const useFetchTemplateList = () => {
  // Get models using react query
  const {
    data,
    // isError, error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["TEMPLATES_LIST"],
    queryFn: () => getTemplateList(),
  });

  // Show toast on fetch error
  // useEffect(() => {
  //   if (isError) toast.error(error.toString());
  // }, [error, isError]);

  // Return data and refetch
  return { data, refetch, isLoading };
};
