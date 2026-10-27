import { cn } from "@avplatform/ui/lib";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

/**
 * Formats a number as a string with commas in US format and upto two decimal places.
 * @param number The number to format.
 * @returns The formatted number string.
 */
function formatNumber(number: number): string {
  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

/**
 * Returns a label for a feature based on its value.
 * @param value The feature value.
 * @param singular Singular label.
 * @param plural Plural label.
 * @param unlimitedLabel Label for unlimited.
 */
function getFeatureLabel(
  value: number,
  singular: string,
  plural: string,
  unlimitedLabel: string,
): string {
  if (value <= 0) return unlimitedLabel;
  if (value === 1) return `1${singular}`;
  return `${formatNumber(value)}${plural}`;
}

/**
 * Returns a formatted label describing the number of credits, including whether the credits are per month or per year.
 *
 * - If `value` is less than or equal to 0, returns "Unlimited credits".
 * - If `value` is 1, returns "1 credit/month" or "1 credit/year" based on `isPerMonth`.
 * - Otherwise, returns "{value} credits/month" or "{value} credits/year" based on `isPerMonth`.
 *
 * @param value - The number of credits.
 * @param isPerMonth - If true, the label will use "month"; otherwise, it will use "year".
 * @returns The formatted credits label.
 */
function getCreditsLabel(value: number, isPerMonth: boolean): string {
  if (value <= 0) return `Unlimited credits`;
  if (value === 1) return `1 credit/${isPerMonth ? "month" : "year"}`;
  return `${formatNumber(value)} credits/${isPerMonth ? "month" : "year"}`;
}

/**
 * Props for the PlanFeatures component, describing the details of a subscription plan.
 */
interface PlanFeaturesProps {
  frequency: string;
  credits: number;
  publishedItems: number;
  historyRetentionDays: number;
  spaces: number;
  storageLimitMB: number;
  users: number;
  className?: string;
}

/**
 * Displays a list of features included in a subscription plan.
 *
 * @param frequency - The billing frequency of the plan ("Monthly" or "Yearly").
 * @param credits - The number of credits included per billing period.
 * @param publishedItems - The number of published agents allowed (use 0 for unlimited).
 * @param historyRetentionDays - The number of days insights and workflow history are retained.
 * @param spaces - The number of spaces included in the plan.
 * @param storageLimitMB - The storage limit in megabytes.
 * @param users - The number of users allowed (use 0 for unlimited).
 * @param className - Optional additional CSS classes for styling.
 *
 * @returns A React component rendering the plan's feature list.
 */
export const PlanFeatures = ({
  frequency,
  credits,
  publishedItems,
  historyRetentionDays,
  spaces,
  storageLimitMB,
  users,
  className,
}: PlanFeaturesProps) => {
  // Generate features list
  const featuresList = [
    `${getCreditsLabel(credits, frequency === "Monthly")}`,
    `${getFeatureLabel(publishedItems, " published Agent", " published Agents", "Unlimited published Agents")}`,
    `${getFeatureLabel(historyRetentionDays, " day", " days", "Unlimited days")} of insights & workflow history`,
    ...(import.meta.env.MODE !== "production"
      ? [`${getFeatureLabel(spaces, " space", " spaces", "Unlimited spaces")}`]
      : []),
    `${getFeatureLabel(storageLimitMB, " MB storage", " MB storage", "Unlimited storage")}`,
    `${getFeatureLabel(users, " user", " users", "Unlimited users")}`,
  ];

  return (
    <div className={cn(className)}>
      <h3 className="font-medium">Plan Includes:</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {featuresList.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-ok" /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};
