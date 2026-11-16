import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useMutation } from "@tanstack/react-query";

import { updateMyProfileInfo } from "../apis/my-account-apis";

export const useProfileInfoFormMutation = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: updateMyProfileInfo,
    onSuccess: (httpResponse, { firstName, lastName }) => {
      const { userSession, setUserSession } = useUserSessionStore.getState();
      if (userSession) setUserSession({ ...userSession, firstName, lastName });
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
