import { toast } from "@avplatform/ui/sonner";
import { useMutation } from "@tanstack/react-query";

import { getSsoAdminConsentUrl } from "@/features/05-tenant-admin/tenant/apis/tenant-info-apis";
import { useFetchTenantPreferences } from "@/features/05-tenant-admin/tenant/hooks/useFetchTenantPreferences";
import { parseSsoConfig } from "@/features/05-tenant-admin/tenant/utils/sso-config-summary.util";

export const useSsoConnectionCard = () => {
  const { data, isLoading } = useFetchTenantPreferences();

  const preferences = data?.data;
  const config = parseSsoConfig(preferences?.ssoConfigJson);

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

  const connectHandler = () => connectWithEntra();

  return {
    isLoading,
    isConnected: Boolean(config.externalTenantId),
    emailDomain: config.emailDomain,
    isSSOEnabled: Boolean(preferences?.isSSOEnabled),
    connectHandler,
    isConnectPending,
  };
};
