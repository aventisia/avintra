import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { updateFlowSilently } from "@/features/react-flow/apis/react-flow-apis";

export const useUpdateInputOutput = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateFlowSilently,
    onSuccess: () => {
      // Success message
      toast.success("InputOutput data updated successfully", {
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
