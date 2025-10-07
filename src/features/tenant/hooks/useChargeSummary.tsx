import { TOP_UP_PRICING } from "../constants/top-up-pricing";
import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";
import { PlanType } from "../types/plan-type";

export const useChargeSummary = (
  plan: SubscriptionPlanDTO | undefined,
  planType: PlanType,
) => {
  const { billingCountry, topUp } = useUpgradePlanDialogStore((state) => ({
    billingCountry: state.billingCountry,
    topUp: state.topUp,
  }));

  const isTaxApplicable = billingCountry === "India";

  const basePrice =
    planType === "monthly"
      ? (plan?.monthlyPrice ?? 0)
      : (plan?.yearlyPrice ?? 0) * 12;

  const topUpTotal = Object.entries(topUp).reduce((acc, [key, value]) => {
    const config = TOP_UP_PRICING[key as keyof typeof TOP_UP_PRICING];
    if (!config) return acc;
    return acc + value * config.unitCost;
  }, 0);

  const subtotal = basePrice + topUpTotal;
  const GST = 0.18;
  const tax = isTaxApplicable ? +(subtotal * GST).toFixed(2) : 0;
  const total = +(subtotal + tax).toFixed(2);

  return {
    basePrice,
    topUpTotal,
    tax,
    total,
    isTaxApplicable,
    topUpBreakdown: Object.entries(topUp).map(([key, quantity]) => {
      const config = TOP_UP_PRICING[key as keyof typeof TOP_UP_PRICING];
      return {
        type: config?.label || key,
        quantity,
        total: quantity * (config?.unitCost ?? 0),
      };
    }),
  };
};
