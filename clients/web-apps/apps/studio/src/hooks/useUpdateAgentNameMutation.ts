import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateFlow } from "@/features/flows-popover/apis/flows-table-apis";

export const useUpdateAgentNameMutation = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateFlow,
    onSuccess: () => {
      // Success message
      toast.success("Agent updated", {
        className: "sonner-toaster-sm",
      });
    },

    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
    },
  });
  return {
    isPending,
    mutate,
  };
};
