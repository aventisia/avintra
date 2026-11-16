import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { formatDate } from "@avplatform/ui/utils";
import { CalendarBlankIcon, CreditCardIcon } from "@phosphor-icons/react";
import { format, formatDistanceToNow, isPast, isValid } from "date-fns";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { CurrentPlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useCreditTopUpMutation } from "@/features/05-tenant-admin/tenant/hooks/useCreditTopUpMutation.ee";

/**
 * Calendar leaf showing the due date's month and day.
 */
const DueDateLeaf = ({ date }: { date: Date }) => (
  <span className="flex w-12 shrink-0 flex-col overflow-hidden rounded-md bg-surface text-center shadow-sm ring-1 ring-line">
    <span className="bg-primary py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground">
      {format(date, "MMM")}
    </span>
    <span className="py-1 font-mono text-[19px] font-medium leading-6 tabular-nums text-ink">
      {format(date, "d")}
    </span>
  </span>
);

const NextPaymentDetails = ({ plan }: { plan: CurrentPlanDto }) => {
  const { isPending: isTopUpPending, insertCreditTopUpMutation } = useCreditTopUpMutation();
  const { nextPayment, currentPlan } = plan;
  const currency = currentPlan.currency || "USD";
  const dueDate = nextPayment?.dueDate ? new Date(nextPayment.dueDate) : null;
  const hasDueDate = dueDate !== null && isValid(dueDate);
  const isOverdue = hasDueDate && isPast(dueDate);
  const totalAmount = nextPayment?.totalAmount ?? 0;

  const handleCreditTopUp = () => {
    if (nextPayment?.subscriptionFee)
      insertCreditTopUpMutation({
        amount: nextPayment.subscriptionFee,
        credits: currentPlan.feature.maxCredits,
        currency: currentPlan.currency,
        includeTax: false,
        type: "Subscription",
        subscriptionId: currentPlan.subscriptionId,
      });
  };

  return (
    <div className="flex flex-col rounded-lg bg-surface ring-1 ring-line">
      <div className="flex items-center gap-3 px-4 pt-4">
        {hasDueDate ? (
          <DueDateLeaf date={dueDate} />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-sunken text-ink-2 ring-1 ring-line">
            <CalendarBlankIcon className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">{formatDate(nextPayment?.dueDate)}</p>
          {hasDueDate && (
            <p
              className={cn(
                "text-[12px]",
                isOverdue ? "font-medium text-warn" : "text-muted-foreground",
              )}
            >
              {isOverdue ? "Was due" : "Due"} {formatDistanceToNow(dueDate, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      <dl className="mx-4 mt-4 space-y-2 text-[12.5px]">
        <div className="flex items-center justify-between">
          <dt className="text-ink-2">Subscription fee</dt>
          <dd className="font-mono tabular-nums text-ink">
            {formatCurrency(nextPayment?.subscriptionFee ?? 0, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-2">Tax</dt>
          <dd className="font-mono tabular-nums text-ink">
            {formatCurrency(nextPayment?.tax ?? 0, currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-line pt-2">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-mono text-[15px] font-semibold tabular-nums text-ink">
            {formatCurrency(totalAmount, currency)}
          </dd>
        </div>
      </dl>

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full gap-1.5"
          disabled={isTopUpPending || totalAmount == 0}
          aria-busy={isTopUpPending}
          onClick={handleCreditTopUp}
        >
          {isTopUpPending ? (
            <LoadingSpinner className="size-4" />
          ) : (
            <CreditCardIcon className="size-4" />
          )}
          {isTopUpPending ? "Initiating payment..." : "Make payment"}
        </Button>
      </div>
    </div>
  );
};

export default NextPaymentDetails;
