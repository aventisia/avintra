import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  getSsoAdminConsentUrl,
  updateTenantSsoState,
} from "@/features/05-tenant-admin/tenant/apis/tenant-info-apis.ee";
import {
  ssoDisableConfirmBtnText,
  ssoDisableConfirmDescription,
  ssoDisableConfirmTitle,
  ssoDisabledSuccessMessage,
  ssoEnableConfirmBtnText,
  ssoEnableConfirmDescription,
  ssoEnableConfirmTitle,
  ssoEnabledSuccessMessage,
  ssoUpdateErrorMessage,
} from "@/features/05-tenant-admin/tenant/constants/tenant-preferences-field-props.ee";
import { useFetchTenantPreferences } from "@/features/05-tenant-admin/tenant/hooks/useFetchTenantPreferences.ee";
import { parseSsoConfig } from "@/features/05-tenant-admin/tenant/utils/sso-config-summary.util.ee";

export const useSsoConnectionCard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useFetchTenantPreferences();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const [optimisticSsoEnabled, setOptimisticSsoEnabled] = useState<boolean | null>(null);

  const preferences = data?.data;
  const config = parseSsoConfig(preferences?.ssoConfigJson);
  const isConnected = Boolean(config.externalTenantId);
  const persistedSsoEnabled = Boolean(preferences?.isSSOEnabled);
  const isSSOAvailable = Boolean(preferences?.isSSOAvailable);
  const isSSOEnabled = optimisticSsoEnabled ?? persistedSsoEnabled;

  const { mutate: connectWithEntra, isPending: isConnectPending } = useMutation({
    mutationFn: getSsoAdminConsentUrl,
    onSuccess: (response) => {
      if (!response?.data) {
        toast.error(response?.message ?? "Could not start the Microsoft Entra connection.");
        return;
      }

      window.location.assign(response.data);
    },
    onError: (error) => toast.error(error.toString()),
  });

  const { mutateAsync: toggleSsoAsync, isPending: isTogglePending } = useMutation({
    mutationFn: updateTenantSsoState,
    onSuccess: (response) => {
      setOptimisticSsoEnabled(null);
      queryClient.setQueryData(["TENANT_PREFERENCES"], response);
      toast.success(
        response.data.isSSOEnabled ? ssoEnabledSuccessMessage : ssoDisabledSuccessMessage,
      );
    },
    onError: (error) => {
      setOptimisticSsoEnabled(null);
      toast.error(typeof error === "string" ? error : ssoUpdateErrorMessage);
    },
  });

  const connectHandler = () => connectWithEntra();

  const toggleSsoHandler = (next: boolean) => {
    if (isTogglePending || next === isSSOEnabled || (!isConnected && next)) return;
    showCustomAlertDialog({
      title: next ? ssoEnableConfirmTitle : ssoDisableConfirmTitle,
      description: next ? ssoEnableConfirmDescription : ssoDisableConfirmDescription,
      confirmBtnText: next ? ssoEnableConfirmBtnText : ssoDisableConfirmBtnText,
      isDestructive: !next,
      showLoadingOnConfirm: true,
      confirmActionFn: async () => {
        setOptimisticSsoEnabled(next);
        try {
          await toggleSsoAsync({ isSSOEnabled: next });
        } catch {
          return;
        }
      },
    });
  };

  return {
    isLoading,
    isConnected,
    emailDomain: config.emailDomain,
    isSSOAvailable,
    isSSOEnabled,
    persistedSsoEnabled,
    ssoDisableWarning: preferences?.ssoDisableWarning,
    connectHandler,
    isConnectPending,
    toggleSsoHandler,
    isTogglePending,
  };
};
