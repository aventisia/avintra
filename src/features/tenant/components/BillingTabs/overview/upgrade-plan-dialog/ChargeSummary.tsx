import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";

import { currencySymbols } from "@/features/tenant/constants/currency-symbol-map";
import { CompanyDetailsDTO } from "@/features/tenant/dtos/company-details-dto";
import { SubscriptionPlanDTO } from "@/features/tenant/dtos/subscription-plans-dto";
import { useChargeSummary } from "@/features/tenant/hooks/useChargeSummary";
import { useCreditTopUpMutation } from "@/features/tenant/hooks/useCreditTopUpMutation";
import { useInsertSubscriptionMutation } from "@/features/tenant/hooks/useInsertSubscriptionMutation";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";
import { PlanFrequency } from "@/features/tenant/types/plan-type";

const ChargeSummary = ({
  plan,
  planFrequency,
  billingData,
  isTopUp = false,
}: {
  plan?: SubscriptionPlanDTO | undefined;
  planFrequency?: PlanFrequency;
  billingData: CompanyDetailsDTO | undefined;
  isTopUp?: boolean;
}) => {
  const { basePrice, tax, total, isTaxApplicable, topUpBreakdown, GST } =
    useChargeSummary(plan, planFrequency);

  const { chosenPlan, currency, topUp } = useUpgradePlanDialogStore();

  const { isPending: isUpgradePending, insertSubscriptionMutation } =
    useInsertSubscriptionMutation();

  const { isPending: isTopUpPending, insertCreditTopUpMutation } =
    useCreditTopUpMutation();

  const handleSubscription = () => {
    insertSubscriptionMutation({
      planId: plan?.id || "",
      amount: total,
      taxRate: GST,
      frequency: planFrequency || "monthly",
      addressLine1: billingData?.addressLine1 || "",
      addressLine2: billingData?.addressLine2 || "",
      city: billingData?.city || "",
      country: billingData?.country || "",
      isWillingToFileGst: billingData?.isWillingToFileGst || false,
      gstNumber: billingData?.gstNumber,
      postalCode: billingData?.postalCode || "",
      state: billingData?.state || "",
    });
  };

  const handleCreditTopUp = () => {
    insertCreditTopUpMutation({
      amount: total,
      credits: topUp.credits,
      currency,
      includeTax: false,
    });
  };

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">Charge Summary</div>
      <div className="space-y-3 p-4 text-sm">
        {plan && basePrice >= 0 ? (
          <SummaryRow
            label="Subscription Fee"
            value={`${currencySymbols[currency]}${basePrice.toFixed(2)}`}
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
                value={`${currencySymbols[currency || "USD"]}${item.total.toFixed(2)}`}
              />
            ),
        )}

        {isTaxApplicable && (
          <SummaryRow
            label="Tax"
            value={`${currencySymbols[currency || "USD"]}${tax.toFixed(2)}`}
          />
        )}

        <Separator />

        <SummaryRow
          label="Amount Due"
          value={`${currencySymbols[currency || "USD"]}${total.toFixed(2)}`}
          className="font-medium"
        />

        {isTopUp ? (
          <Button
            disabled={isTopUpPending || total == 0}
            onClick={handleCreditTopUp}
            className="mt-5 w-full"
          >
            {isTopUpPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Initiating Payment...
              </>
            ) : (
              "Make Payment"
            )}
          </Button>
        ) : (
          <Button
            disabled={isUpgradePending || total == 0}
            onClick={handleSubscription}
            className="mt-5 w-full"
          >
            {isUpgradePending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Initiating Payment...
              </>
            ) : (
              "Make Payment"
            )}
          </Button>
        )}
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
