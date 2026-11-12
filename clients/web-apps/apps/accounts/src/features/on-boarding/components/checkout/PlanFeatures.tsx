import { CheckIcon } from "@phosphor-icons/react";

import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";

const formatNumber = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

const countLabel = (value: number, singular: string, plural: string, unlimited: string) => {
  if (value <= 0) return unlimited;
  return value === 1 ? `1${singular}` : `${formatNumber(value)}${plural}`;
};

const getPlanFeatures = (plan: SubscriptionPlanDTO) => {
  const period = plan.frequency === "Monthly" ? "month" : "year";
  return [
    plan.maxCredits <= 0
      ? "Unlimited credits"
      : `${formatNumber(plan.maxCredits)} credit${plan.maxCredits === 1 ? "" : "s"}/${period}`,
    countLabel(
      plan.maxPublishedItems,
      " published agent",
      " published agents",
      "Unlimited published agents",
    ),
    `${countLabel(plan.historyRetentionDays, " day", " days", "Unlimited")} of insights & workflow history`,
    ...(import.meta.env.MODE !== "production"
      ? [countLabel(plan.maxSpaces, " space", " spaces", "Unlimited spaces")]
      : []),
    countLabel(plan.storageLimitMB, " MB storage", " MB storage", "Unlimited storage"),
    countLabel(plan.maxUsers, " user", " users", "Unlimited users"),
  ];
};

export const PlanFeatures = ({ plan }: { plan: SubscriptionPlanDTO }) => (
  <ul className="space-y-2.5 text-sm">
    {getPlanFeatures(plan).map((feature) => (
      <li key={feature} className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckIcon weight="bold" className="h-3 w-3" />
        </span>
        {feature}
      </li>
    ))}
  </ul>
);
