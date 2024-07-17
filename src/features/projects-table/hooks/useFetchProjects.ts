import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../apis/projects-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

/**
 * Custom hook to fetch projects using react query.
 * @returns An object containing the fetched data, isFetching flag, and isLoading flag.
 */
export const useFetchProjects = () => {
  // Get projects using react query
  const { data, isFetching, isLoading } = useQuery({
    queryKey: DATA_QUERY_KEY,
    queryFn: () => getProjects(),
  });

  // Return isFetching and isLoading flag
  return { data, isFetching, isLoading };
};
