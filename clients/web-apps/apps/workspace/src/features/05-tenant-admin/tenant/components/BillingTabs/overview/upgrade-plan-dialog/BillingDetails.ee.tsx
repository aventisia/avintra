import { RecordPanel, RecordSection } from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { CompanyDetailsDTO } from "@/features/05-tenant-admin/tenant/dtos/company-details-dto.ee";

const BillingDetails = ({ billingData }: { billingData: CompanyDetailsDTO | undefined }) => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == userSession?.email;

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

  const rows = [
    isIndividualUser
      ? { label: "Name", value: `${userSession?.firstName} ${userSession?.lastName}` }
      : { label: "Company", value: organizationName },
    { label: "Address", value: fullAddress },
    { label: "GST number", value: gstNumber },
  ].filter((row) => row.value);

  return (
    <RecordSection title="Billing details">
      <RecordPanel>
        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-[12.5px]">
          {rows.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 break-words text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </RecordPanel>
    </RecordSection>
  );
};

export default BillingDetails;
