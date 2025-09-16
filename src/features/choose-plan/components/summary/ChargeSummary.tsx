import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { useChargeSummary } from "../../hooks/useChargeSummary";
import { useInsertSubscriptionMutation } from "../../hooks/useInsertSubscriptionMutation";
import { PlanType } from "../../types/plan-type";

const ChargeSummary = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: PlanType;
}) => {
  const { basePrice, tax, total, isTaxApplicable, effectiveBilling } =
    useChargeSummary(plan, planType);

  const { isPending, insertSubscriptionMutation } =
    useInsertSubscriptionMutation();

  const handleFreePlan = () => {
    insertSubscriptionMutation({
      planId: plan?.id || "",
      amount: total,
      taxRate: tax,
      frequency: planType,
      ...effectiveBilling,
      isWillingToFileGst: !!effectiveBilling.isWillingToFileGst,
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">Charge Summary:</p>
      <Separator className="mt-2" />

      <div className="space-y-2 py-2 text-sm">
        <SummaryRow
          label="Subscription Fee"
          value={`$${basePrice.toFixed(2)}`}
        />
        {isTaxApplicable && (
          <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />
        )}
        <Separator />
        <SummaryRow
          label="Amount Due"
          value={`$${total.toFixed(2)}`}
          className="font-medium"
        />
      </div>

      {total === 0 ? (
        <Button
          className="mt-2 w-full"
          disabled={isPending}
          onClick={handleFreePlan}
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              Starting...
            </>
          ) : (
            "Start"
          )}
        </Button>
      ) : (
        <Button className="mt-2 w-full">Make Payment</Button>
      )}
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
