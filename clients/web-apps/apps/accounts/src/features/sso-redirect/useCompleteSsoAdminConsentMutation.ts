import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { completeSsoAdminConsent } from "./sso-redirect-apis";

export const useCompleteSsoAdminConsentMutation = () => {
  const [consentError, setConsentError] = useState<unknown>(null);

  const { mutate: completeSsoAdminConsentMutation } = useMutation({
    mutationFn: ({ grantedTenantId, state }: { grantedTenantId: string; state: string }) =>
      completeSsoAdminConsent(grantedTenantId, state),
    onSuccess: () => {
      window.location.assign(import.meta.env.VITE_WORKSPACE_PATH + "tenant/preferences");
    },
    onError: (error) => setConsentError(error),
  });

  return { completeSsoAdminConsentMutation, consentError };
};
