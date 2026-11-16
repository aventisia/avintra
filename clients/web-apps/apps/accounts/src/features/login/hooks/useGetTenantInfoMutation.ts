import {
  discoverTenant,
  getSocialLoginUrl,
  getTenantInfo,
} from "@avplatform/ui/apis/accounts-auth-apis";
import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import type { EmailDto } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { hasPlanIntent } from "@/constants/post-login-destination";

import { useLoginStore } from "../stores/login-store";

const isMicrosoftLoginUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url);

    return (
      protocol === "https:" &&
      (hostname === "login.microsoftonline.com" || hostname.endsWith(".microsoftonline.com"))
    );
  } catch {
    return false;
  }
};

export const useGetTenantInfoMutation = () => {
  // Get store state and actions
  const { setStepNo, setLoginData, setSocialLoginProvider } = useLoginStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      setLoginData: state.setLoginData,
      setSocialLoginProvider: state.setSocialLoginProvider,
    })),
  );

  // Define mutation
  const { mutate: getTenantInfoMutation, isPending: isInfoPending } = useMutation({
    mutationFn: async (postObj: EmailDto) => {
      // Home realm discovery first so a single sign-on domain never reaches the password step
      const discoverResponse = await discoverTenant(postObj);
      const ssoLoginUrl = discoverResponse?.data?.ssoLoginUrl ?? null;

      if (ssoLoginUrl && isMicrosoftLoginUrl(ssoLoginUrl)) {
        return {
          ssoLoginUrl,
          tenantId: discoverResponse?.data?.tenantId ?? "",
          tenantInfo: null,
          socialLoginUrl: null as string | null,
        };
      }

      // Fallback to the existing tenant-info contract when the domain has no active single sign-on
      const tenantInfo = await getTenantInfo(postObj);

      // A passwordless account skips the password step: resolve its provider URL here
      const socialProvider = tenantInfo?.data?.socialLoginProvider ?? null;
      if (socialProvider) {
        try {
          const redirect = new URLSearchParams(window.location.search).get("redirect");
          const loginUrlResponse = await getSocialLoginUrl(
            socialProvider,
            redirect,
            hasPlanIntent(),
          );
          return {
            ssoLoginUrl: null,
            tenantId: "",
            tenantInfo,
            socialLoginUrl: loginUrlResponse.data ?? null,
          };
        } catch {
          return { ssoLoginUrl: null, tenantId: "", tenantInfo, socialLoginUrl: null };
        }
      }

      return { ssoLoginUrl: null, tenantId: "", tenantInfo, socialLoginUrl: null };
    },
    onSuccess: ({ ssoLoginUrl, tenantId, tenantInfo, socialLoginUrl }, variables) => {
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

      if (tenantInfo.data.ssoConfigJson && isMicrosoftLoginUrl(tenantInfo.data.ssoConfigJson)) {
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

        // A passwordless account can only continue with the provider it is linked to
        setSocialLoginProvider(tenantInfo.data.socialLoginProvider ?? null);

        // Skip the password step and go straight to the provider; fall back to it only when the URL could not be resolved
        if (socialLoginUrl) {
          window.location.assign(socialLoginUrl);
          return;
        }

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
