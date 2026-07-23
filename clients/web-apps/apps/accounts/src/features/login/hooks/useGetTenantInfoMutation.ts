import { getTenantInfo } from "@avplatform/ui/apis/accounts-auth-apis";
import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { useLoginStore } from "../stores/login-store";

export const useGetTenantInfoMutation = () => {
  // Get store state and actions
  const { setStepNo, setLoginData } = useLoginStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setLoginData: state.setLoginData,
    })),
  );

  // Define mutation
  const { mutate: getTenantInfoMutation, isPending: isInfoPending } = useMutation({
    mutationFn: getTenantInfo,
    onSuccess: ({ data, message }) => {
      // If data is undefined show error
      if (!data) {
        toast.error(message);
        return;
      }
      // Set userName in localstorage
      localStorage.setItem(USER_NAME_LS_KEY, data.userName);

      if (data.ssoConfigJson) {
        // TODO: if SSO enabled then route
        window.location.assign(data.ssoConfigJson);
      } else {
        // Set tenantId and email/username
        setLoginData({
          tenantId: data.tenantId,
          email: data.userName,
          pwd: "",
        });

        // Go to next step - Login using Pwd
        setStepNo(2);
      }
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return mutation and pending status
  return { getTenantInfoMutation, isInfoPending };
};
