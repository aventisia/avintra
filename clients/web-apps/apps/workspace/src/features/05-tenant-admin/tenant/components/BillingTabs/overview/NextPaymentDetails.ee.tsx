import { LoadingSpinner, Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { formatDate } from "@avplatform/ui/utils";
import { CalendarIcon } from "lucide-react";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { CurrentPlanDto } from "@/features/05-tenant-admin/tenant/dtos/current-plan-dto.ee";
import { useCreditTopUpMutation } from "@/features/05-tenant-admin/tenant/hooks/useCreditTopUpMutation.ee";

interface NextPaymentDetailsProps {
  plan: CurrentPlanDto | undefined;
}

const NextPaymentDetails = ({ plan }: NextPaymentDetailsProps) => {
  const { isPending: isTopUpPending, insertCreditTopUpMutation } = useCreditTopUpMutation();

  const handleCreditTopUp = () => {
    if (plan?.nextPayment?.subscriptionFee)
      insertCreditTopUpMutation({
        amount: plan?.nextPayment?.subscriptionFee,
        credits: plan?.currentPlan.feature.maxCredits,
        currency: plan?.currentPlan.currency,
        includeTax: false,
        type: "Subscription",
        subscriptionId: plan?.currentPlan.subscriptionId,
      });
  };

  return (
    <div className="flex flex-col rounded-lg border pb-6">
      <div className="p-4">
        <p className="text-heading text-ink">Next Payment</p>
      </div>
      <Separator />

      <div className="flex-col p-4">
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <span className="grid size-9 place-items-center rounded-md border border-line bg-sunken text-ink-2">
            <CalendarIcon className="size-4" />
          </span>
          <div className="text-sm">
            <p className="text-muted-foreground">Due/Renewal Date</p>
            <p className="font-mono font-medium">{formatDate(plan?.nextPayment?.dueDate)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="font-medium">Billing Details:</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p>Subscription Fee</p>
              <p className="font-mono">
                {formatCurrency(
                  plan?.nextPayment?.subscriptionFee ?? 0,
                  plan?.currentPlan.currency || "USD",
                )}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p>Tax</p>
              <p className="font-mono">
                {formatCurrency(plan?.nextPayment?.tax ?? 0, plan?.currentPlan.currency || "USD")}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <p>Total Amount</p>
              <p className="font-mono">
                {formatCurrency(
                  plan?.nextPayment?.totalAmount ?? 0,
                  plan?.currentPlan.currency || "USD",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4">
        <Button
          className="mt-auto w-full border-primary text-primary"
          variant={"outline"}
          disabled={isTopUpPending || plan?.nextPayment?.totalAmount == 0}
          onClick={handleCreditTopUp}
        >
          {isTopUpPending ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Initiating Payment...
            </>
          ) : (
            "Make Payment"
          )}{" "}
        </Button>
      </div>
    </div>
  );
};

export default NextPaymentDetails;
