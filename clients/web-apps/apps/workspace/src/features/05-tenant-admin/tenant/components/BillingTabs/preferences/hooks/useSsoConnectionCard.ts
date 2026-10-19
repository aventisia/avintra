import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  getSsoAdminConsentUrl,
  updateTenantPreferences,
} from "@/features/05-tenant-admin/tenant/apis/tenant-info-apis";
import { useFetchTenantPreferences } from "@/features/05-tenant-admin/tenant/hooks/useFetchTenantPreferences";

/** Summary of the stored tenant single sign-on configuration document */
export type SsoConfigSummary = {
  externalTenantId: string;
  emailDomain: string;
  byoClientId: string;
};

const emptySsoConfigSummary: SsoConfigSummary = {
  externalTenantId: "",
  emailDomain: "",
  byoClientId: "",
};

const parseSsoConfig = (ssoConfigJson?: string): SsoConfigSummary => {
  if (!ssoConfigJson) return emptySsoConfigSummary;

  try {
    const parsed = JSON.parse(ssoConfigJson) as Partial<SsoConfigSummary>;

    return {
      externalTenantId: parsed.externalTenantId ?? "",
      emailDomain: parsed.emailDomain ?? "",
      byoClientId: parsed.byoClientId ?? "",
    };
  } catch {
    return emptySsoConfigSummary;
  }
};

export const useSsoConnectionCard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useFetchTenantPreferences();

  const preferences = data?.data;
  const config = parseSsoConfig(preferences?.ssoConfigJson);

  const [byoClientId, setByoClientId] = useState(config.byoClientId);
  const [byoClientSecret, setByoClientSecret] = useState("");
  const [isDomainAttested, setIsDomainAttested] = useState(Boolean(preferences?.domainVerified));

  useEffect(() => {
    setByoClientId(config.byoClientId);
    setIsDomainAttested(Boolean(preferences?.domainVerified));
  }, [config.byoClientId, preferences?.domainVerified]);

  const buildSsoConfigJson = () =>
    JSON.stringify({
      v: 1,
      provider: "microsoft_entra",
      externalTenantId: config.externalTenantId,
      emailDomain: config.emailDomain,
      byoClientId: byoClientId.trim() || undefined,
      byoClientSecret: byoClientSecret || undefined,
      domainVerified: Boolean(preferences?.domainVerified),
    });

  const { mutate: saveSsoConfig, isPending: isSavePending } = useMutation({
    mutationFn: updateTenantPreferences,
    onSuccess: (response) => {
      if (!response?.data) {
        toast.error(response?.message ?? "Could not save the single sign-on configuration.");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["TENANT_PREFERENCES"] });
      setByoClientSecret("");
      toast.success("Single sign-on settings saved.");
    },
    onError: (error) => toast.error(error.toString()),
  });

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

  const saveSsoConfigHandler = () => {
    if (!preferences) return;

    saveSsoConfig({
      ...preferences,
      ssoConfigJson: buildSsoConfigJson(),
      domainVerifyAttestation: isDomainAttested,
    });
  };

  const connectHandler = () => connectWithEntra();

  return {
    isLoading,
    isConnected: Boolean(config.externalTenantId),
    emailDomain: config.emailDomain,
    isSSOEnabled: Boolean(preferences?.isSSOEnabled),
    isSecretPresent: Boolean(preferences?.ssoSecretPresent),
    isDomainAttested,
    setIsDomainAttested,
    byoClientId,
    setByoClientId,
    byoClientSecret,
    setByoClientSecret,
    saveSsoConfigHandler,
    isSavePending,
    connectHandler,
    isConnectPending,
  };
};
