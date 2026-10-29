import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { CompanyDetailsDTO } from "@/features/05-tenant-admin/tenant/dtos/company-details-dto.ee";

const BillingDetails = ({ billingData }: { billingData: CompanyDetailsDTO | undefined }) => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == userSession?.email;

  const renderRow = (label: string, value: string | undefined) =>
    value ? (
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="col-span-1 font-medium text-muted-foreground">{label}</div>
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
    [addressLine1, addressLine2, city, state, country?.replace(/([a-z])([A-Z])/g, "$1 $2")]
      .filter(Boolean)
      .join(", ") + (postalCode ? ` - ${postalCode}` : "");

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">Billing Details</div>
      <div className="space-y-3 p-4">
        {isIndividualUser
          ? renderRow("Name", `${userSession?.firstName} ${userSession?.lastName}`)
          : renderRow("Company Name", organizationName)}
        {renderRow("Billing Address", fullAddress)}
        {renderRow("GST Number", gstNumber)}
      </div>
    </div>
  );
};

export default BillingDetails;
