import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

import { formatCurrency } from "../../constants/currency-symbol-map";
import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { useChargeSummary } from "../../hooks/useChargeSummary";
import { useInsertSubscriptionMutation } from "../../hooks/useInsertSubscriptionMutation";
import type { PlanFrequency } from "../../types/plan-type";

const ChargeSummary = ({
  plan,
  planFrequency,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planFrequency: PlanFrequency;
}) => {
  const { basePrice, tax, total, isTaxApplicable, effectiveBilling, GST } = useChargeSummary(plan);

  const { isPending, insertSubscriptionMutation } = useInsertSubscriptionMutation();

  const handleSubscription = () => {
    insertSubscriptionMutation({
      planId: plan?.id || "",
      amount: total,
      taxRate: GST,
      frequency: planFrequency,
      firstName: effectiveBilling.firstName,
      lastName: effectiveBilling.lastName,
      addressLine1: effectiveBilling.addressLine1,
      addressLine2: effectiveBilling.addressLine2,
      city: effectiveBilling.city,
      postalCode: effectiveBilling.postalCode,
      state: effectiveBilling.state,
      country: effectiveBilling.country,
      gstNumber: effectiveBilling.gstNumber,
      isWillingToFileGst: !!effectiveBilling.isWillingToFileGst,
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">Charge summary</p>
      <Separator className="mt-2" />

      <div className="space-y-2 py-2 text-sm">
        <SummaryRow
          label="Subscription fee"
          value={formatCurrency(basePrice, plan?.currency ?? "USD")}
        />
        {isTaxApplicable && (
          <SummaryRow label="Tax" value={formatCurrency(tax, plan?.currency ?? "USD")} />
        )}
        <Separator />
        <SummaryRow
          label="Amount due"
          value={formatCurrency(total, plan?.currency ?? "USD")}
          className="font-medium"
        />
      </div>

      {total === 0 ? (
        <Button size="lg" className="mt-2 w-full" disabled={isPending} onClick={handleSubscription}>
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
        <Button size="lg" disabled={isPending} onClick={handleSubscription} className="mt-2 w-full">
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              Initiating payment...
            </>
          ) : (
            "Make payment"
          )}
        </Button>
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
