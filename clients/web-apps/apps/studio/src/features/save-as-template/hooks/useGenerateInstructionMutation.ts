import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { generateTemplateInstruction } from "../apis/save-as-template-apis";

/**
 * Hook to handle template instruction generation mutation.
 * Shows success/error toasts on API response.
 */
export const useGenerateInstructionMutation = () => {
  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  const { isPending, mutate, isSuccess, data } = useMutation({
    mutationFn: generateTemplateInstruction,

    onSuccess: (response) => {
      toast.success(response?.message, { className: "sonner-toaster-sm" });
      if (userSession?.deploymentType == "Commercial")
        queryClient.invalidateQueries({ queryKey: ["available-credits"] });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { isPending, mutate, isSuccess, data };
};
