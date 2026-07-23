import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateBillingAddress } from "../apis/my-account-apis";

export const useCompanyInfoFormMutation = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateBillingAddress,
    onSuccess: (httpResponse) => {
      // Success message
      toast.success(httpResponse?.message, {
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
