import { getProjects, DATA_QUERY_KEY } from "@/features/projects-table";
import { useQuery } from "@tanstack/react-query";

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
