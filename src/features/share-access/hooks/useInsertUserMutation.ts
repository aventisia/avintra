import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFlowUser } from "../apis/share-flow-apis";
import { useLocation } from "react-router-dom";
import { FLOWS_USER_KEY } from "../constants";

export const useInsertUserMutation = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("mid") || "";

  const { isPending, mutate, mutateAsync } = useMutation({
    mutationFn: insertFlowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOWS_USER_KEY, modelId] });
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return {
    isPending,
    mutate,
    mutateAsync,
  };
};
