import { useUserSessionStore } from "@avplatform/ui/stores";
import { setUserSessionLocally } from "@avplatform/ui/utils";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { COUNTRY_LS_KEY, INDIVIDUAL_ORGANIZATION_NAME } from "@/constants/variables";

import { billingInfoSchema } from "../constants/billing-info-zod-schema";
import { useUpdateTenantInfoMutation } from "./useUpdateTenantInfoMutation";

type BillingFormData = z.infer<typeof billingInfoSchema>;

/**
 * Completes the organization setup that free sign-up defers: saves the account type and country,
 * refreshes the session, and stores the country that ChoosePlan prices from.
 * Call it before persisting billing data; it resolves to false when the update fails.
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
    try {
      const response = await updateTenantInfoMutation({
        type: formData.organizationType,
        organizationName:
          formData.organizationType === "Organization"
            ? (formData.organizationName ?? "")
            : INDIVIDUAL_ORGANIZATION_NAME,
        domain: userSession?.email?.split("@")[1] ?? "",
        country: formData.country,
      });

      setUserSession(setUserSessionLocally(response.data));
      localStorage.setItem(COUNTRY_LS_KEY, formData.country);
      return true;
    } catch {
      return false;
    }
  };

  return { saveDeferredTenantProfile };
};
