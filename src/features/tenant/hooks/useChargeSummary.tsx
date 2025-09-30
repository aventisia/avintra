import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";
import { PlanType } from "../types/plan-type";

export const useChargeSummary = (
  plan: SubscriptionPlanDTO | undefined,
  planType: PlanType,
) => {
  const { billingCountry } = useUpgradePlanDialogStore((state) => ({
    billingCountry: state.billingCountry,
  }));

  const isTaxApplicable = billingCountry === "India";

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
  };
};
