import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { getTenantInfo } from "@/react-toolkit/apis/accounts-auth-apis";
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
  const { mutate: getTenantInfoMutation, isPending: isInfoPending } =
    useMutation({
      mutationFn: getTenantInfo,
      onSuccess: ({ data }) => {
        if (data.ssoConfigJson) {
          // TODO: if SSO enabled then route
        } else {
          // Set userName in localstorage
          localStorage.setItem("userName", data.userName);

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
    });

  // Return mutation and pending status
  return { getTenantInfoMutation, isInfoPending };
};
