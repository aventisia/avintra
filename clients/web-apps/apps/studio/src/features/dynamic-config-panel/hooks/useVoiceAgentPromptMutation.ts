import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { generateVoiceAgentPrompt } from "../apis/prompt-generation-apis";

/**
 * Generates or refines a VoiceAgent Goal/Role/Instructions block and refreshes credit usage.
 */
export const useVoiceAgentPromptMutation = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  const { isPending, mutate, isSuccess, data } = useMutation({
    mutationFn: generateVoiceAgentPrompt,

    onSuccess: () => {
      if (userSession?.deploymentType == "Commercial")
        queryClient.invalidateQueries({ queryKey: ["available-credits"] });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { isPending, mutate, isSuccess, data };
};
