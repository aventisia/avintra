import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useNavigate } from "react-router-dom";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";

const ChargeSummary = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: string;
}) => {
  const navigate = useNavigate();

  const basePrice =
    planType === "monthly"
      ? (plan?.monthlyPrice ?? 0)
      : (plan?.yearlyPrice ?? 0);

  const tax = +(basePrice * 0.18).toFixed(2);
  const total = +(basePrice + tax).toFixed(2);

  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">Charge Summary:</p>
      <Separator className="mt-2" />

      <div className="space-y-2 py-2 text-sm">
        <SummaryRow
          label="Subscription Fee"
          value={`$${basePrice.toFixed(2)}`}
        />
        <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />
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
          onClick={() =>
            navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL)
          }
        >
          Start
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
