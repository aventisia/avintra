import { useUserSessionStore } from "@avplatform/ui/stores";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { billingInfoSchema } from "../constants/billing-info-zod-schema";
import { getParsedBillingFromStorage } from "../utils";
import { useUpdateTenantInfoMutation } from "./useUpdateTenantInfoMutation";

type BillingFormData = z.infer<typeof billingInfoSchema>;

/**
 * Saves the account type and country that free sign-up skips, once per change.
 * Resolves to false when the update fails.
 */
export const useSaveDeferredTenantProfile = () => {
  const { userSession, setUserSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
      setUserSession: state.setUserSession,
    })),
  );

  const { updateTenantInfoMutation } = useUpdateTenantInfoMutation();

  const saveDeferredTenantProfile = async (formData: BillingFormData) => {
    const saved: Partial<BillingFormData> = getParsedBillingFromStorage(userSession?.tenantId);
    if (
      saved.organizationType === formData.organizationType &&
      saved.country === formData.country
    ) {
      return true;
    }

    try {
      const response = await updateTenantInfoMutation({
        type: formData.organizationType,
        organizationName:
          formData.organizationType === "Organization"
            ? (formData.organizationName ?? "")
            : "Individual Users",
        domain: userSession?.email?.split("@")[1] ?? "",
        country: formData.country,
      });

      setUserSession(setUserSessionLocally(response.data));
      return true;
    } catch {
      return false;
    }
  };

  return { saveDeferredTenantProfile };
};
