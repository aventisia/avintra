import { Separator } from "@aventisia/ui";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanType } from "../../types/plan-type";
import { getCreditsLabel } from "../../utils";
import { FeatureList } from "./FeatureList";

export const PlanFeatures = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO;
  planType: PlanType;
}) => {
  const features = [
    getCreditsLabel(
      plan.maxCredits,
      plan.name == "Starter" ? "monthly" : planType,
    ),
    `${plan.maxPublishedItems} Published Agents or AI Models`,
    `${plan.historyRetentionDays} days of insights & workflow history`,
    `${plan.maxSpaces} Worc Spaces`,
    plan.storageLimitMB < 0
      ? "Unlimited Storage"
      : `${plan.storageLimitMB} MB storage`,
    plan.maxUsers < 0 ? "Unlimited Users" : `${plan.maxUsers} Users`,
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
