import { completeSsoAdminConsent } from "./sso-redirect-apis";
import { useMutation } from "@tanstack/react-query";

export const useCompleteSsoAdminConsentMutation = () => {
  // Define mutation
  const { mutate: completeSsoAdminConsentMutation } = useMutation({
    mutationFn: ({ grantedTenantId, state }: { grantedTenantId: string; state: string }) =>
      completeSsoAdminConsent(grantedTenantId, state),
    onSuccess: () => {
      window.location.assign(import.meta.env.VITE_WORKSPACE_PATH + "tenant/preferences");
    },
    onError: () => {
      window.location.assign(import.meta.env.VITE_ACCOUNTS_PATH + "login");
    },
  });

  // Return mutation
  return { completeSsoAdminConsentMutation };
};
