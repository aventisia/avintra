import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { RecordSection } from "@avplatform/ui/record-sheet";
import { toast } from "@avplatform/ui/sonner";
import { LockSimpleIcon } from "@phosphor-icons/react";

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

  const isBusy = isTopUpPending || isUpgradePending;
  const payAction = isTopUp
    ? { onClick: handleCreditTopUp, disabled: isTopUpPending || total == 0 }
    : isFrequencyChange
      ? { onClick: undefined, disabled: false }
      : { onClick: handleSubscription, disabled: isUpgradePending || total == 0 };
  const payLabel = isFrequencyChange && planFrequency == "monthly" ? "Continue" : "Make payment";

  return (
    <RecordSection
      title={isFrequencyChange && planFrequency == "monthly" ? "Next charge" : "Charge summary"}
    >
      <div className="rounded-lg bg-surface ring-1 ring-line">
        <dl className="space-y-2 px-4 pt-4 text-[12.5px]">
          {plan && basePrice >= 0 ? (
            <SummaryRow label="Subscription fee" value={formatCurrency(basePrice, currency)} />
          ) : null}

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

          <div className="flex items-center justify-between border-t border-dashed border-line pt-2">
            <dt className="font-semibold text-ink">Amount due</dt>
            <dd className="font-mono text-[15px] font-semibold tabular-nums text-ink">
              {formatCurrency(total, currency)}
            </dd>
          </div>
        </dl>

        <div className="p-4">
          <Button
            className="w-full gap-1.5"
            disabled={payAction.disabled}
            aria-busy={isBusy}
            onClick={payAction.onClick}
          >
            {isBusy ? <LoadingSpinner className="size-4" /> : <LockSimpleIcon className="size-4" />}
            {isBusy ? "Initiating payment..." : payLabel}
          </Button>
        </div>
      </div>
    </RecordSection>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <dt className="text-ink-2">{label}</dt>
    <dd className="font-mono tabular-nums text-ink">{value}</dd>
  </div>
);

export default ChargeSummary;
