import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertFlowUser } from "../apis/share-flow-apis";
import { useSearchParams } from "react-router-dom";
import { FLOWS_USER_KEY } from "../constants";

export const useInsertUserMutation = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("f") || "";

  const { isPending, mutate, mutateAsync } = useMutation({
    mutationFn: insertFlowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOWS_USER_KEY, flowId] });
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
