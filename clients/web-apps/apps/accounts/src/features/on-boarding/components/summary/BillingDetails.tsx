import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../../stores/choose-plan-store";

const BillingDetails = () => {
  const { billingData } = useChoosePlanStore(
    useShallow((state) => ({ billingData: state.billingData })),
  );
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == userSession?.email;

  const renderRow = (label: string, value: string | undefined) =>
    value ? (
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-1 text-muted-foreground font-medium">
          {label}
        </div>
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

  const fullAddress =
    [
      addressLine1,
      addressLine2,
      city,
      state,
      country?.replace(/([a-z])([A-Z])/g, "$1 $2"),
    ]
      .filter(Boolean)
      .join(", ") + (postalCode ? ` - ${postalCode}` : "");

  return (
    <div className="max-w-[35rem] rounded-lg border">
      <div className="border-b p-4 font-medium text-base">Billing Details</div>
      <div className="p-4 space-y-3">
        {isIndividualUser
          ? renderRow(
              "Name",
              `${userSession?.firstName} ${userSession?.lastName}`,
            )
          : renderRow("Company Name", organizationName)}
        {renderRow("Billing Address", fullAddress)}
        {renderRow("GST Number", gstNumber)}
      </div>
    </div>
  );
};

export default BillingDetails;
