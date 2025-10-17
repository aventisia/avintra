import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useEffect, useState } from "react";

import { currencySymbols } from "../../constants/currency-symbol-map";
import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { useChargeSummary } from "../../hooks/useChargeSummary";
import { useInsertSubscriptionMutation } from "../../hooks/useInsertSubscriptionMutation";
import { PlanFrequency } from "../../types/plan-type";

const ChargeSummary = ({
  plan,
  planFrequency,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planFrequency: PlanFrequency;
}) => {
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const { basePrice, tax, total, isTaxApplicable, effectiveBilling } =
    useChargeSummary(plan);

  const { isPending, insertSubscriptionMutation } =
    useInsertSubscriptionMutation(isRazorpayReady);

  const handleSubscription = () => {
    insertSubscriptionMutation({
      planId: plan?.id || "",
      amount: total,
      taxRate: tax,
      frequency: planFrequency,
      ...effectiveBilling,
      isWillingToFileGst: !!effectiveBilling.isWillingToFileGst,
    });
  };

  useEffect(() => {
    //<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

    // Check if already loaded
    if (
      document.querySelector(
        `script[src="https://checkout.razorpay.com/v1/checkout.js"]`,
      )
    ) {
      setIsRazorpayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => console.warn("Failed to load Razorpay script");
    document.body.appendChild(script);
  }, []);

  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">Charge Summary:</p>
      <Separator className="mt-2" />

      <div className="space-y-2 py-2 text-sm">
        <SummaryRow
          label="Subscription Fee"
          value={`${currencySymbols[plan?.currency ?? "USD"]}${basePrice.toFixed(2)}`}
        />
        {isTaxApplicable && (
          <SummaryRow
            label="Tax"
            value={`${currencySymbols[plan?.currency ?? "USD"]}${tax.toFixed(2)}`}
          />
        )}
        <Separator />
        <SummaryRow
          label="Amount Due"
          value={`${currencySymbols[plan?.currency ?? "USD"]}${total.toFixed(2)}`}
          className="font-medium"
        />
      </div>

      {total === 0 ? (
        <Button
          className="mt-2 w-full"
          disabled={isPending}
          onClick={handleSubscription}
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
        <Button
          disabled={isPending}
          onClick={handleSubscription}
          className="mt-2 w-full"
        >
          {isPending ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              Initiating Payment...
            </>
          ) : (
            "Make Payment"
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
