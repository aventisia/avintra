import { Separator } from "@aventisia/ui";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { FeatureList } from "./FeatureList";

export const PlanFeatures = ({
  plan,
  interval,
}: {
  plan: SubscriptionPlanDTO;
  interval: "monthly" | "yearly";
}) => {
  const features = [
    `${plan.maxCredits} credits/${interval}`,
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
