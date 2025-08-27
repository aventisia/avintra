import { getMySession } from "@/react-toolkit/apis/accounts-me-apis";

import { useQuery } from "@tanstack/react-query";

export const useFetchUserSession = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user-session"],
    queryFn: () => getMySession(),
  });

  return { data, refetch, isLoading };
};
