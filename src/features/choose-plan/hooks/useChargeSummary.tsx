import { useChoosePlanStore } from "@/features/choose-plan/stores/choose-plan-store";
import { INDIVIDUAL_USERS } from "@/features/sign-up/constants";
import { BILLING_INFO_KEY } from "@/react-toolkit/constants";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";

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

export const useChargeSummary = (
  plan: SubscriptionPlanDTO | undefined,
  planType: string,
) => {
  const { userSession } = useUserSessionStore((state) => ({
    userSession: state.userSession,
  }));

  const { billingData } = useChoosePlanStore((state) => ({
    billingData: state.billingData,
  }));

  const storedBillingData = getParsedBillingFromStorage();
  const effectiveBilling = {
    ...DEFAULT_BILLING,
    ...storedBillingData,
    ...billingData,
  };

  const isIndividualUser = userSession?.tenantName === INDIVIDUAL_USERS;
  const isTaxApplicable =
    effectiveBilling.country === "India" && !isIndividualUser;

  const basePrice =
    planType === "monthly"
      ? (plan?.monthlyPrice ?? 0)
      : (plan?.yearlyPrice ?? 0) * 12;

  const GST = 0.18;
  const tax = isTaxApplicable ? +(basePrice * GST).toFixed(2) : 0;
  const total = +(basePrice + tax).toFixed(2);

  return {
    basePrice,
    tax,
    total,
    isTaxApplicable,
    effectiveBilling,
  };
};

const getParsedBillingFromStorage = () => {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(BILLING_INFO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn("Invalid billing data in localStorage", error);
    return {};
  }
};
