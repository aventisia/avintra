import { discoverTenant, getTenantInfo } from "@avplatform/ui/apis/accounts-auth-apis";
import type { EmailDto } from "@avplatform/ui/dtos";
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
    mutationFn: async (postObj: EmailDto) => {
      // Home realm discovery first so a single sign-on domain never reaches the password step
      const discoverResponse = await discoverTenant(postObj);
      const ssoLoginUrl = discoverResponse?.data?.ssoLoginUrl ?? null;

      if (ssoLoginUrl) {
        return { ssoLoginUrl, tenantId: discoverResponse?.data?.tenantId ?? "", tenantInfo: null };
      }

      // Fallback to the existing tenant-info contract when the domain has no active single sign-on
      const tenantInfo = await getTenantInfo(postObj);

      return { ssoLoginUrl: null, tenantId: "", tenantInfo };
    },
    onSuccess: ({ ssoLoginUrl, tenantId, tenantInfo }, variables) => {
      if (ssoLoginUrl) {
        localStorage.setItem(USER_NAME_LS_KEY, variables.email);

        // Keep the email so admins can fall back to password login if the provider is unreachable
        setLoginData({ tenantId, email: variables.email, pwd: "" });

        window.location.assign(ssoLoginUrl);
        return;
      }

      if (!tenantInfo?.data) {
        toast.error(tenantInfo?.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Set userName in localstorage
      localStorage.setItem(USER_NAME_LS_KEY, tenantInfo.data.userName);

      if (tenantInfo.data.ssoConfigJson) {
        setLoginData({
          tenantId: tenantInfo.data.tenantId,
          email: tenantInfo.data.userName,
          pwd: "",
        });

        window.location.assign(tenantInfo.data.ssoConfigJson);
      } else {
        // Set tenantId and email/username
        setLoginData({
          tenantId: tenantInfo.data.tenantId,
          email: tenantInfo.data.userName,
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
