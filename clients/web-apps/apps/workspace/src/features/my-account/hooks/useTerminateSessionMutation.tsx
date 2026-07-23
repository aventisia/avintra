import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postTerminateSessions } from "../apis/my-account-apis";

export const useTerminateSessionMutation = () => {
  // Get the query client
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTerminateSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ACTIVE_SESSIONS"] });
      toast.success("Session terminated successfully.");
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });
};
