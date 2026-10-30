import { useMutation } from "@tanstack/react-query";

import { completeSsoAdminConsent } from "./sso-redirect-apis";

export const useCompleteSsoAdminConsentMutation = () => {
  // Define mutation
  const {
    mutate: completeSsoAdminConsentMutation,
    error,
    isError,
  } = useMutation({
    mutationFn: ({ grantedTenantId, state }: { grantedTenantId: string; state: string }) =>
      completeSsoAdminConsent(grantedTenantId, state),
    onSuccess: () => {
      window.location.assign(import.meta.env.VITE_WORKSPACE_PATH + "tenant/preferences");
    },
  });

  // Return mutation
  return { completeSsoAdminConsentMutation, consentError: isError ? error : null };
};
