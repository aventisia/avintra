import { PlanFrequency } from "../types/plan-type";

function displayValue(value: number) {
  if (value < 0 || value > 9999999) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}
function getCreditsLabel(
  maxCredits: number,
  planFrequency: PlanFrequency,
): string {
  const timeUnit = planFrequency === "monthly" ? "month" : "year";

  const creditLabel = maxCredits === 1 ? "credit" : "credits";

  return `${displayValue(maxCredits)} ${creditLabel} per ${timeUnit}`;
}

export { getCreditsLabel, displayValue };
