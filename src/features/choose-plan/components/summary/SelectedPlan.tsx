import { Label } from "@aventisia/ui/label";
import { RadioGroup, RadioGroupItem } from "@aventisia/ui/radio-group";
import { Check } from "lucide-react";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";

const SelectedPlan = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: string;
}) => {
  const isYearly = planType === "yearly";
  const creditAmount = isYearly
    ? plan?.maxCredits && plan?.maxCredits * 12
    : plan?.maxCredits;
  const price = isYearly ? plan?.yearlyPrice : plan?.monthlyPrice;

  const formatValue = (val: number | undefined, fallback = "—") =>
    val ?? fallback;

  return (
    <RadioGroup value="selected">
      <div className="rounded-lg border">
        <div className="flex items-center gap-3 border-b p-4">
          <RadioGroupItem value="selected" id="selected" />
          <div className="flex w-full items-end justify-between">
            <Label htmlFor="selected" className="text-base">
              {plan?.name}
              <div className="mt-1 text-sm">
                <span className="text-base">{creditAmount}</span>{" "}
                <span className="text-muted-foreground">
                  credits/{isYearly ? "year" : "month"}
                </span>
              </div>
            </Label>
            <p className="text-muted-foreground">
              <span className="text-accent-foreground">${price}</span>{" "}
              {isYearly ? "/Year" : "/Month"}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-md font-semibold">Plan Includes:</p>
          <ul className="text-sm mt-2 space-y-1">
            <PlanFeature
              label={`${creditAmount} credits/${isYearly ? "year" : "month"}`}
            />
            <PlanFeature
              label={`${formatValue(plan?.maxPublishedItems)} Published Agents or AI Models`}
            />
            <PlanFeature
              label={`${formatValue(plan?.historyRetentionDays)} days of insights & workflow history`}
            />
            <PlanFeature label={`${formatValue(plan?.maxSpaces)} Workspaces`} />
            <PlanFeature
              label={
                plan?.storageLimitMB && plan.storageLimitMB < 0
                  ? "Unlimited Storage"
                  : `${plan?.storageLimitMB} MB storage`
              }
            />
            <PlanFeature
              label={
                plan?.maxUsers && plan.maxUsers < 0
                  ? "Unlimited Users"
                  : `${plan?.maxUsers} Users`
              }
            />
          </ul>
        </div>
      </div>
    </RadioGroup>
  );
};

const PlanFeature = ({ label }: { label: string }) => (
  <li className="flex items-start gap-2">
    <CheckMark />
    <span>{label}</span>
  </li>
);

const CheckMark = () => (
  <div className="rounded-full bg-green-500 p-[2px]">
    <Check className="h-3 w-3 text-white" />
  </div>
);

export default SelectedPlan;
