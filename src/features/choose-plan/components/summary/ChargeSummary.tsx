import { INDIVIDUAL_USERS } from "@/features/sign-up/constants";
import { BILLING_INFO_KEY } from "@/react-toolkit/constants";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";

const ChargeSummary = ({
  plan,
  planType,
}: {
  plan: SubscriptionPlanDTO | undefined;
  planType: string;
}) => {
  const navigate = useNavigate();
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == INDIVIDUAL_USERS;

  // Try loading from localStorage
  const storedBillingData =
    typeof window !== "undefined"
      ? localStorage.getItem(BILLING_INFO_KEY)
      : null;

  let parsedStoredData = { country: "" };

  if (storedBillingData) {
    try {
      parsedStoredData = JSON.parse(storedBillingData);
    } catch (e) {
      console.warn(e, "Invalid local storage data for billingInfo");
    }
  }
  const taxApplicable =
    parsedStoredData?.country == "India" && !isIndividualUser;

  const basePrice =
    planType === "monthly"
      ? (plan?.monthlyPrice ?? 0)
      : Number(plan?.yearlyPrice) * 12;

  const tax = taxApplicable ? +(basePrice * 0.18).toFixed(2) : 0;
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
        {taxApplicable && (
          <SummaryRow label="Tax" value={`$${tax.toFixed(2)}`} />
        )}{" "}
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
