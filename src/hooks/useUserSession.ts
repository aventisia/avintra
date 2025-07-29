import { useQuery } from "@tanstack/react-query";
import {  getMySession } from "@/react-toolkit/apis/accounts-me-apis";


export const useFetchUserSession = () => {
  const { data, 
    isLoading,
    refetch } = useQuery({
    queryKey: ["user-session"],
    queryFn: () => getMySession(),
  });


  return { data, refetch, isLoading };
};
