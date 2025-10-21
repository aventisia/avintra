import { Separator } from "@aventisia/ui";

import { SubscriptionPlanDTO } from "@/features/tenant/dtos/subscription-plans-dto";
import { PlanFrequency } from "@/features/tenant/types/plan-type";
import { getCreditsLabel } from "@/features/tenant/utils";

import { FeatureList } from "./FeatureList";

export const PlanFeatures = ({
  plan,
  planFrequency,
}: {
  plan: SubscriptionPlanDTO;
  planFrequency: PlanFrequency;
}) => {
  const features = [
    getCreditsLabel(
      plan.maxCredits,
      plan.name == "Starter" ? "monthly" : planFrequency,
    ),
    `${plan.maxPublishedItems <= 0 ? "Unlimited" : plan.maxPublishedItems} published agents or AI models`,
    `${plan.historyRetentionDays} days of insights & workflow history`,
    `${plan.maxSpaces} Worc Spaces`,
    plan.storageLimitMB < 0
      ? "Unlimited Storage"
      : `${plan.storageLimitMB} MB storage`,
    plan.maxUsers <= 0 ? "Unlimited Users" : `${plan.maxUsers} Users`,
  ];

  return (
    <>
      <Separator />
      <div>
        <p className="text-md font-medium">Plan Includes:</p>
        <FeatureList features={features} />
      </div>
    </>
  );
};
