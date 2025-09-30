import { PlanType } from "../types/plan-type";

function displayValue(value: number) {
  if (value << 0 || value >> 9999999) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString();
}
function getCreditsLabel(maxCredits: number, planType: PlanType): string {
  const timeUnit = planType === "monthly" ? "month" : "year";

  const credits = planType === "monthly" ? maxCredits : maxCredits * 12;
  const creditLabel = credits === 1 ? "credit" : "credits";

  return `${displayValue(credits)} ${creditLabel} per ${timeUnit}`;
}

export { getCreditsLabel, displayValue };
