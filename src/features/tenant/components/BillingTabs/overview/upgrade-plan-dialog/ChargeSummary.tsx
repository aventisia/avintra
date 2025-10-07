import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { SubscriptionPlanDTO } from "@/features/tenant/dtos/subscription-plans-dto";
import { useChargeSummary } from "@/features/tenant/hooks/useChargeSummary";
import { PlanType } from "@/features/tenant/types/plan-type";

const ChargeSummary = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: PlanType;
}) => {
  const { basePrice, tax, total, isTaxApplicable, topUpBreakdown } =
    useChargeSummary(plan, planType);

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">Charge Summary</div>
      <div className="space-y-3 p-4 text-sm">
        <SummaryRow
          label="Subscription Fee"
          value={`$${basePrice.toFixed(2)}`}
        />

        {/* Show top-up breakdown if any */}
        {topUpBreakdown.map(
          (item) =>
            item.quantity > 0 && (
              <SummaryRow
                key={item.type}
                label={`${item.type}`}
                value={`$${item.total.toFixed(2)}`}
              />
            ),
        )}

        {isTaxApplicable && (
          <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />
        )}

        <Separator />

        <SummaryRow
          label="Amount Due"
          value={`$${total.toFixed(2)}`}
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
