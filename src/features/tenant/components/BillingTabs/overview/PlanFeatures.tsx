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

interface PlanFeaturesProps {
  frequency: string;
  credits: number;
  publishedItems: number;
  historyRetentionDays: number;
  spaces: number;
  storageLimitMB: number;
  users: number;
}


/**
 * Displays a list of features included in a subscription plan.
 *
 * @param frequency - The billing frequency of the plan ("Monthly" or "Yearly").
 * @param credits - The number of credits included per billing period.
 * @param publishedItems - The number of published agents or AI models allowed (use 0 for unlimited).
 * @param historyRetentionDays - The number of days insights and workflow history are retained.
 * @param spaces - The number of spaces included in the plan.
 * @param storageLimitMB - The storage limit in megabytes.
 * @param users - The number of users allowed (use 0 for unlimited).
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
}: PlanFeaturesProps) => {
  // Generate features list
  const featuresList = [
    `${formatNumber(credits)} credits/${frequency === "Monthly" ? "month" : "year"}`,
    `${publishedItems <= 0 ? "Unlimited" : formatNumber(publishedItems)} published ${
      publishedItems === 1
        ? "Agent or AI Model"
        : "Agents or AI Models"
    }`,
    `${formatNumber(historyRetentionDays)} ${historyRetentionDays === 1 ? "day" : "days"} of insights & workflow history`,
    `${formatNumber(spaces)} ${spaces === 1 ? "space" : "spaces"}`,
    `${formatNumber(storageLimitMB)}mb storage`,
    `${users <= 0 ? "Unlimited" : formatNumber(users)} ${users === 1 ? "user" : "users"}`,
  ];

  return (
    <div className="border-r">
      <h3 className="font-medium">Plan Includes:</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {featuresList.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};