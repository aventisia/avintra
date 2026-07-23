import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import type { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useChoosePlanStore } from "../stores/choose-plan-store";
import { getParsedBillingFromStorage } from "../utils";

const DEFAULT_BILLING = {
  country: "",
  addressLine1: "",
  city: "",
  isWillingToFileGst: false,
  postalCode: "",
  state: "",
  addressLine2: "",
  gstNumber: "",
};

export const useChargeSummary = (plan: SubscriptionPlanDTO | undefined) => {
  const { billingData } = useChoosePlanStore((state) => ({
    billingData: state.billingData,
  }));

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const storedBillingData = getParsedBillingFromStorage(userSession?.tenantId);
  const effectiveBilling = {
    ...DEFAULT_BILLING,
    ...storedBillingData,
    ...billingData,
  };

  const isTaxApplicable = effectiveBilling.country === "India";

  const basePrice = plan?.price ? plan?.price : 0;
  const GST = 0.18;
  const tax = isTaxApplicable ? +(basePrice * GST).toFixed(2) : 0;
  const total = +(basePrice + tax).toFixed(2);

  return {
    basePrice,
    tax,
    total,
    isTaxApplicable,
    effectiveBilling,
    GST,
  };
};
