import { useUserSessionStore } from "@avplatform/ui/stores";

import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { generateSTTResponse } from "../apis/llm-pipelines-apis";

/**
 * Hook to handle stt generation mutation.
 * Shows success/error toasts on API response.
 */
export const useExecuteSTTMutation = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  const { isPending, mutate, isSuccess, data, reset } = useMutation({
    mutationFn: generateSTTResponse,

    onSuccess: () => {
      if (userSession?.deploymentType == "Commercial")
        queryClient.invalidateQueries({ queryKey: ["available-credits"] });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { isPending, mutate, isSuccess, data, reset };
};
