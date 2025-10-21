import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { currencySymbols } from "@/features/tenant/constants/currency-symbol-map";
import { SubscriptionPlanDTO } from "@/features/tenant/dtos/subscription-plans-dto";
import { useChargeSummary } from "@/features/tenant/hooks/useChargeSummary";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";
import { PlanFrequency } from "@/features/tenant/types/plan-type";

const ChargeSummary = ({
  plan,
  planFrequency,
}: {
  plan?: SubscriptionPlanDTO | undefined;
  planFrequency?: PlanFrequency;
}) => {
  const { basePrice, tax, total, isTaxApplicable, topUpBreakdown } =
    useChargeSummary(plan, planFrequency);

  const { chosenPlan } = useUpgradePlanDialogStore();

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">Charge Summary</div>
      <div className="space-y-3 p-4 text-sm">
        {plan && basePrice >= 0 ? (
          <SummaryRow
            label="Subscription Fee"
            value={`${currencySymbols[plan.currency]}${basePrice.toFixed(2)}`}
          />
        ) : null}

        {/* Show top-up breakdown if any */}
        {topUpBreakdown.map(
          (item) =>
            (item.quantity > 0 ||
              (item.type == "Credits" && chosenPlan == "Credits")) && (
              <SummaryRow
                key={item.type}
                label={`${item.type}`}
                value={`${currencySymbols[plan?.currency || "USD"]}${item.total.toFixed(2)}`}
              />
            ),
        )}

        {isTaxApplicable && (
          <SummaryRow
            label="Tax"
            value={`${currencySymbols[plan?.currency || "USD"]}${tax.toFixed(2)}`}
          />
        )}

        <Separator />

        <SummaryRow
          label="Amount Due"
          value={`${currencySymbols[plan?.currency || "USD"]}${total.toFixed(2)}`}
          className="font-medium"
        />

        <Button className="!mt-5 w-full">Make Payment</Button>
      </div>
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={`flex items-center justify-between ${className}`}>
    <p className="text-muted-foreground">{label}</p>
    <p>{value}</p>
  </div>
);

export default ChargeSummary;
