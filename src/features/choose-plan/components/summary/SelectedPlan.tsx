import { Label } from "@aventisia/ui/label";
import { RadioGroup, RadioGroupItem } from "@aventisia/ui/radio-group";
import { Check } from "lucide-react";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanType } from "../../types/plan-type";
import { getCreditsLabel } from "../../utils";

const SelectedPlan = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: PlanType;
}) => {
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
            </Label>
            <div className="flex gap-1 items-baseline">
              <p className="text-lg">
                {planType == "monthly" ? (
                  <> ${plan?.monthlyPrice}</>
                ) : (
                  <>
                    <span className="line-through text-sm">
                      ${plan?.monthlyPrice}
                    </span>
                    <span className="font-semibold"> ${plan?.yearlyPrice}</span>
                  </>
                )}
              </p>
              <span className="text-sm text-muted-foreground">/{"month"}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-md font-semibold">Plan Includes:</p>
          <ul className="text-sm mt-2 space-y-1">
            {plan?.maxCredits && (
              <PlanFeature
                label={getCreditsLabel(plan?.maxCredits, planType)}
              />
            )}
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
