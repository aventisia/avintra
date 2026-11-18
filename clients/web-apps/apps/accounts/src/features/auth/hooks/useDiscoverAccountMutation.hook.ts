import {
  discoverTenant,
  getSocialLoginUrl,
  getTenantInfo,
  isEmailAvailable,
} from "@avplatform/ui/apis/accounts-auth-apis";
import { IS_TAURI, USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import type { EmailDto } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { hasPlanIntent } from "@/constants/post-login-destination";

import { useAuthStore } from "../stores/auth-store";

type AccountDiscovery =
  | { kind: "redirect"; email: string; url: string }
  | { kind: "password"; email: string }
  | { kind: "social-only"; email: string; provider: string }
  | { kind: "new"; email: string };

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

const isUnregisteredEmail = async (email: string) => {
  try {
    const response = await isEmailAvailable({ userInput: email });
    return response.data?.result === true;
  } catch {
    return false;
  }
};

const getProviderLoginUrl = async (provider: string) => {
  try {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    const response = await getSocialLoginUrl(provider, redirect, hasPlanIntent());
    return response.data ?? null;
  } catch {
    return null;
  }
};

const discoverAccount = async ({ email }: EmailDto): Promise<AccountDiscovery> => {
  const discovery = await discoverTenant({ email });
  const ssoLoginUrl = discovery?.data?.ssoLoginUrl ?? null;
  if (ssoLoginUrl && isMicrosoftLoginUrl(ssoLoginUrl)) {
    return { kind: "redirect", email, url: ssoLoginUrl };
  }

  const tenantInfo = await getTenantInfo({ email }).catch(async (error: unknown) => {
    // IMPORTANT NOTE: tenant-info answers an unknown email with a 400, which the axios instance
    // rejects as a plain string; only a free email turns that rejection into a sign-up.
    if (!IS_TAURI && typeof error === "string" && (await isUnregisteredEmail(email))) return null;
    throw error;
  });

  if (!tenantInfo) return { kind: "new", email };
  if (!tenantInfo.data) throw tenantInfo.message || "Something went wrong. Please try again.";

  const { userName, ssoConfigJson, socialLoginProvider } = tenantInfo.data;

  if (ssoConfigJson && isMicrosoftLoginUrl(ssoConfigJson)) {
    return { kind: "redirect", email: userName, url: ssoConfigJson };
  }

  if (socialLoginProvider) {
    const providerLoginUrl = await getProviderLoginUrl(socialLoginProvider);
    return providerLoginUrl
      ? { kind: "redirect", email: userName, url: providerLoginUrl }
      : { kind: "social-only", email: userName, provider: socialLoginProvider };
  }

  return { kind: "password", email: userName };
};

/** Works out what an email continues to: single sign-on, a password, its provider, or sign-up. */
const useDiscoverAccountMutation = () => {
  const continueAs = useAuthStore((state) => state.continueAs);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { mutate: discoverAccountMutation, isPending } = useMutation({
    mutationFn: discoverAccount,
    onSuccess: (discovery) => {
      if (discovery.kind !== "new") localStorage.setItem(USER_NAME_LS_KEY, discovery.email);

      switch (discovery.kind) {
        case "redirect":
          continueAs(discovery.email, "start");
          setIsRedirecting(true);
          window.location.assign(discovery.url);
          return;
        case "password":
          continueAs(discovery.email, "password");
          return;
        case "social-only":
          continueAs(discovery.email, "social-only", discovery.provider);
          return;
        case "new":
          continueAs(discovery.email, "create");
      }
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  return { discoverAccountMutation, isDiscoverPending: isPending || isRedirecting };
};

export { useDiscoverAccountMutation };
