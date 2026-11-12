import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { ArrowRightIcon, LockIcon } from "@phosphor-icons/react";

import { formatCurrency } from "../../constants/currency-symbol-map";
import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";

type OrderSummaryProps = {
  plan: SubscriptionPlanDTO;
  tax: number;
  total: number;
  isTaxApplicable: boolean;
  needsBilling: boolean;
  isPending: boolean;
  onContinueFree: () => void;
};

export const OrderSummary = ({
  plan,
  tax,
  total,
  isTaxApplicable,
  needsBilling,
  isPending,
  onContinueFree,
}: OrderSummaryProps) => {
  const money = (amount: number) => formatCurrency(amount, plan.currency);
  const isFree = plan.price <= 0;
  const ctaLabel = isFree ? "Continue with Starter" : `Pay ${money(total)}`;

  return (
    <aside className="rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold">Order summary</h2>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{plan.name} plan</p>
          <p className="text-sm text-muted-foreground">
            {isFree ? "Free forever" : `Billed ${plan.frequency.toLowerCase()}`}
          </p>
        </div>
        <p className="font-medium">{money(plan.price)}</p>
      </div>

      <Separator className="my-5" />

      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{money(plan.price)}</dd>
        </div>
        {isTaxApplicable && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">GST (18%)</dt>
            <dd>{money(tax)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t pt-3 text-base font-semibold">
          <dt>Due today</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={isPending}
        type={needsBilling ? "submit" : "button"}
        onClick={needsBilling ? undefined : onContinueFree}
      >
        {isPending ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            {isFree ? "Setting up your workspace..." : "Opening secure checkout..."}
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        {isFree ? (
          "Upgrade any time from your workspace billing settings."
        ) : (
          <>
            <LockIcon className="h-3.5 w-3.5" />
            Payments are processed securely by Razorpay.
          </>
        )}
      </p>
    </aside>
  );
};
