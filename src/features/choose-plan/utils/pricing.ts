import { SubscriptionPlanDTO } from "../dtos/subscription-plans-dto";

export function getPlanPricing(
  plan: SubscriptionPlanDTO,
  type: "monthly" | "yearly",
) {
  return {
    credits: type === "monthly" ? plan.maxCredits : plan.maxCredits * 12,
    price: type === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
  };
}
