import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateMyProfileInfo } from "../apis/my-account-apis";

export const useProfileInfoFormMutation = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateMyProfileInfo,
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
