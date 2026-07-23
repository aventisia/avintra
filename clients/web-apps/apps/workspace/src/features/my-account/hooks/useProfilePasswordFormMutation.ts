import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { updateMyAccountPassword } from "../apis/my-account-apis";

export const useProfilePasswordFormMutation = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateMyAccountPassword,
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
