import { ADD_ON_PRICING } from "../constants/add-on-pricing";
import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";
import { PlanType } from "../types/plan-type";

export const useChargeSummary = (
  plan?: SubscriptionPlanDTO | undefined,
  planType?: PlanType,
) => {
  const { billingCountry, topUp } = useUpgradePlanDialogStore((state) => ({
    billingCountry: state.billingCountry,
    topUp: state.topUp,
  }));

  const isTaxApplicable = billingCountry === "India";

  // Calculate the base price depending on the planType (monthly or yearly)
  const basePrice =
    planType === "monthly"
      ? (plan?.monthlyPrice ?? 0)
      : (plan?.yearlyPrice ?? 0) * 12;

  // Calculate the total top-up charges based on the frequency (monthly/yearly)
  const topUpTotal = Object.entries(topUp).reduce((acc, [key, value]) => {
    if (key == "credits") {
      return acc + value * (1 / 500);
    }
    const config = ADD_ON_PRICING[key as keyof typeof ADD_ON_PRICING];
    if (!config) return acc;

    // Adjust unit cost based on the selected frequency (monthly/yearly)
    const adjustedUnitCost =
      planType === "monthly" ? config.unitCost.monthly : config.unitCost.yearly;

    return acc + value * adjustedUnitCost;
  }, 0);

  // Subtotal, GST, and Total calculation
  const subtotal = basePrice + topUpTotal;
  const GST = 0.18;
  const tax = isTaxApplicable ? +(subtotal * GST).toFixed(2) : 0;
  const total = +(subtotal + tax).toFixed(2);

  // Breakdown of top-ups with cost for display
  const topUpBreakdown = Object.entries(topUp).map(([key, quantity]) => {
    if (key == "credits")
      return {
        type: "Credits",
        quantity,
        total: quantity * (1 / 500),
      };
    const config = ADD_ON_PRICING[key as keyof typeof ADD_ON_PRICING];
    if (!config) return { type: key, quantity, total: 0 };

    const adjustedUnitCost =
      planType === "monthly" ? config.unitCost.monthly : config.unitCost.yearly;

    return {
      type: config?.label || key,
      quantity,
      total: quantity * adjustedUnitCost,
    };
  });

  return {
    basePrice,
    topUpTotal,
    tax,
    total,
    isTaxApplicable,
    topUpBreakdown,
  };
};
