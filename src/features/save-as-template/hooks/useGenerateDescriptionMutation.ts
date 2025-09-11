import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { generateTemplateDescription } from "../apis/save-as-template-apis";

/**
 * Hook to handle template description generation mutation.
 * Shows success/error toasts on API response.
 */
export const useGenerateDescriptionMutation = () => {
  const { isPending, mutate, isSuccess, data } = useMutation({
    mutationFn: generateTemplateDescription,

    onSuccess: (response) => {
      toast.success(response?.message, { className: "sonner-toaster-sm" });
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return { isPending, mutate, isSuccess, data };
};
