import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../../stores/choose-plan-store";
import { isIndividualTenant } from "../../utils";

const BillingDetails = () => {
  const { billingData } = useChoosePlanStore(
    useShallow((state) => ({ billingData: state.billingData })),
  );
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = isIndividualTenant(userSession);

  const renderRow = (label: string, value: string | undefined) =>
    value ? (
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-1 text-muted-foreground font-medium">{label}</div>
        <div className="col-span-2">{value}</div>
      </div>
    ) : null;

  const {
    organizationName,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    gstNumber,
  } = billingData || {};

  const fullName = [
    billingData?.firstName ?? userSession?.firstName,
    billingData?.lastName ?? userSession?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const fullAddress =
    [addressLine1, addressLine2, city, state, country?.replace(/([a-z])([A-Z])/g, "$1 $2")]
      .filter(Boolean)
      .join(", ") + (postalCode ? ` - ${postalCode}` : "");

  return (
    <div className="max-w-[35rem] rounded-lg border">
      <div className="border-b p-4 font-medium text-base">Billing details</div>
      <div className="p-4 space-y-3">
        {isIndividualUser
          ? renderRow("Name", fullName || userSession?.email)
          : renderRow("Company name", organizationName || userSession?.email)}
        {renderRow("Billing address", fullAddress)}
        {renderRow("GST Number", gstNumber)}
      </div>
    </div>
  );
};

export default BillingDetails;
