import { PlanFrequency } from "../types/plan-type";

function displayValue(value: number) {
  if (value === -1) return "Unlimited";
  if (value === 0) return "N/A";
  return value.toLocaleString();
}
function getCreditsLabel(maxCredits: number, planFrequency: PlanFrequency): string {
  const timeUnit = planFrequency === "monthly" ? "month" : "year";

  const credits = planFrequency === "monthly" ? maxCredits : maxCredits * 12;
  const creditLabel = credits === 1 ? "credit" : "credits";

  return `${displayValue(credits)} ${creditLabel} per ${timeUnit}`;
}

export { getCreditsLabel, displayValue };
