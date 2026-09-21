import { useShallow } from "zustand/react/shallow";

import { ADD_ON_PRICING } from "../constants/add-on-pricing";
import { currencyToPricePer500Credits } from "../constants/credit-price-map";
import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";
import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store";
import { PlanFrequency } from "../types/plan-type";

export const useChargeSummary = (
  plan?: SubscriptionPlanDTO | undefined,
  planFrequency?: PlanFrequency,
) => {
  const { billingCountry, topUp, currency } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      billingCountry: state.billingCountry,
      topUp: state.topUp,
      currency: state.currency,
    })),
  );

  const isTaxApplicable = billingCountry === "India";

  // Calculate the base price depending on the planFrequency (monthly or yearly)
  const basePrice = plan?.price ? plan.price : 0;

  // Calculate the total top-up charges based on the frequency (monthly/yearly)
  const topUpTotal = Object.entries(topUp).reduce((acc, [key, value]) => {
    if (key === "credits") {
      const unitPrice = currencyToPricePer500Credits[currency] ?? 1;
      const units = value / 500;
      return acc + units * unitPrice;
    }

    const config = ADD_ON_PRICING[key as keyof typeof ADD_ON_PRICING];
    if (!config) return acc;

    // Adjust unit cost based on the selected frequency (monthly/yearly)
    const adjustedUnitCost =
      planFrequency === "monthly" ? config.unitCost.monthly : config.unitCost.yearly;

    return acc + value * adjustedUnitCost;
  }, 0);

  // Subtotal, GST, and Total calculation
  const subtotal = basePrice + topUpTotal;
  const GST = 0.18;
  const tax = isTaxApplicable ? +(subtotal * GST).toFixed(2) : 0;
  const total = +(subtotal + tax).toFixed(2);

  // Breakdown of top-ups with cost for display
  const topUpBreakdown = Object.entries(topUp).map(([key, quantity]) => {
    if (key === "credits") {
      const unitPrice = currencyToPricePer500Credits[currency] ?? 1;
      const units = quantity / 500;
      return {
        type: "Credits",
        quantity,
        total: units * unitPrice,
      };
    }

    const config = ADD_ON_PRICING[key as keyof typeof ADD_ON_PRICING];
    if (!config) return { type: key, quantity, total: 0 };

    const adjustedUnitCost =
      planFrequency === "monthly" ? config.unitCost.monthly : config.unitCost.yearly;

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
    GST,
  };
};
