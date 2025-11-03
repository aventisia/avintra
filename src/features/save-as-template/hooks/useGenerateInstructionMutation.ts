import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateTemplateInstruction } from "../apis/save-as-template-apis";

/**
 * Hook to handle template instruction generation mutation.
 * Shows success/error toasts on API response.
 */
export const useGenerateInstructionMutation = () => {
  const queryClient = useQueryClient();
  
  const { isPending, mutate, isSuccess, data } = useMutation({
    mutationFn: generateTemplateInstruction,

    onSuccess: (response) => {
      toast.success(response?.message, { className: "sonner-toaster-sm" });
      queryClient.invalidateQueries({ queryKey: ["available-credits"] });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { isPending, mutate, isSuccess, data };
};
