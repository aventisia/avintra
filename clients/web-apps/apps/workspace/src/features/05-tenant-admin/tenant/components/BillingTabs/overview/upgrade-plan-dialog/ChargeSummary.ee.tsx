import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { toast } from "@avplatform/ui/sonner";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { CompanyDetailsDTO } from "@/features/05-tenant-admin/tenant/dtos/company-details-dto.ee";
import { SubscriptionPlanDTO } from "@/features/05-tenant-admin/tenant/dtos/subscription-plans-dto.ee";
import { useChargeSummary } from "@/features/05-tenant-admin/tenant/hooks/useChargeSummary.ee";
import { useCreditTopUpMutation } from "@/features/05-tenant-admin/tenant/hooks/useCreditTopUpMutation.ee";
import { useInsertSubscriptionMutation } from "@/features/05-tenant-admin/tenant/hooks/useInsertSubscriptionMutation.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type.ee";

const ChargeSummary = ({
  plan,
  planFrequency,
  billingData,
  isTopUp = false,
  isFrequencyChange = false,
}: {
  plan?: SubscriptionPlanDTO | undefined;
  planFrequency?: PlanFrequency;
  billingData: CompanyDetailsDTO | undefined;
  isTopUp?: boolean;
  isFrequencyChange?: boolean;
}) => {
  const { basePrice, tax, total, isTaxApplicable, topUpBreakdown, GST } = useChargeSummary(
    plan,
    planFrequency,
  );

  const { chosenPlan, currency, topUp } = useUpgradePlanDialogStore();

  const { isPending: isUpgradePending, insertSubscriptionMutation } =
    useInsertSubscriptionMutation();

  const { isPending: isTopUpPending, insertCreditTopUpMutation } = useCreditTopUpMutation();

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
    const credits = topUp.credits || 0;
    console.log(credits);
    if (credits % 500 !== 0) {
      toast.error("Credits must be in multiples of 500");
      return;
    }

    if (credits < 500) {
      toast.error("Minimum 500 credits required");
      return;
    }
    insertCreditTopUpMutation({
      amount: total,
      credits: topUp.credits,
      currency,
      includeTax: false,
      type: "TopUp",
    });
  };

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">
        {isFrequencyChange && planFrequency == "monthly" && "Next"} Charge Summary
      </div>
      <div className="space-y-3 p-4 text-sm">
        {plan && basePrice >= 0 ? (
          <SummaryRow label="Subscription Fee" value={formatCurrency(basePrice, currency)} />
        ) : null}

        {/* Show top-up breakdown if any */}
        {topUpBreakdown.map(
          (item) =>
            (item.quantity > 0 || (item.type == "Credits" && chosenPlan == "Credits")) && (
              <SummaryRow
                key={item.type}
                label={`${item.type}`}
                value={formatCurrency(item.total, currency)}
              />
            ),
        )}

        {isTaxApplicable && <SummaryRow label="Tax" value={formatCurrency(tax, currency)} />}

        <Separator />

        <SummaryRow
          label="Amount Due"
          value={formatCurrency(total, currency)}
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
        ) : isFrequencyChange ? (
          <Button className="mt-5 w-full">
            {isTopUpPending ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Initiating Payment...
              </>
            ) : planFrequency == "monthly" ? (
              "Continue"
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
