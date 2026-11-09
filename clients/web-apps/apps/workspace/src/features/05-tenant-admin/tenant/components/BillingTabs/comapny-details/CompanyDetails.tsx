import { Button } from "@avplatform/ui/buttons";
import {
  RecordEmpty,
  RecordFact,
  RecordFactGrid,
  RecordPanel,
  RecordSection,
  RecordSummary,
} from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  BuildingsIcon,
  EnvelopeSimpleIcon,
  GlobeHemisphereWestIcon,
  MapPinIcon,
  PencilSimpleIcon,
  ReceiptIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails.ee";
import { useCompanyDetailsDialogStore } from "@/features/05-tenant-admin/tenant/store/company-details/company-details-dialog-store.ee";

import TabLoader from "../TabLoader.ee";
import CompanyDetailsDialog from "./company-details-dialog/CompanyDetailsDialog";

const formatCountry = (country?: string) => country?.replace(/([a-z])([A-Z])/g, "$1 $2");

const CompanyDetails = () => {
  const { setOpen } = useCompanyDetailsDialogStore();
  const isIndividualUser = useUserSessionStore(
    (state) => state.userSession?.tenantName == state.userSession?.email,
  );
  const { data, isLoading } = useFetchCompanyDetails();
  const details = data?.data;

  if (isLoading) return <TabLoader />;

  const addressLines = [
    details?.addressLine1,
    details?.addressLine2,
    [details?.city, [details?.state, details?.postalCode].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", "),
    formatCountry(details?.country),
  ].filter(Boolean);

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecordSection
            title="Billing contact"
            action={
              <Button variant="ghost" size="xs" className="gap-1" onClick={() => setOpen(true)}>
                <PencilSimpleIcon className="size-3.5" />
                Edit
              </Button>
            }
          >
            <RecordSummary>
              <RecordFactGrid>
                {!isIndividualUser && (
                  <RecordFact
                    Icon={BuildingsIcon}
                    label="Company name"
                    value={details?.organizationName}
                  />
                )}
                <RecordFact
                  Icon={EnvelopeSimpleIcon}
                  label="Billing email"
                  value={details?.billingEmail}
                />
                <RecordFact Icon={UserIcon} label="Contact" value={details?.contactPerson} />
                <RecordFact
                  Icon={GlobeHemisphereWestIcon}
                  label="Country"
                  value={formatCountry(details?.country)}
                />
              </RecordFactGrid>
            </RecordSummary>
          </RecordSection>

          <RecordSection title="Billing address">
            {addressLines.length > 0 ? (
              <RecordPanel className="flex items-start gap-3 py-4">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <address className="text-[13px] not-italic leading-5 text-ink">
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </RecordPanel>
            ) : (
              <RecordEmpty mark={<MapPinIcon className="size-5 text-muted-foreground" />}>
                No billing address yet.
              </RecordEmpty>
            )}
          </RecordSection>
        </div>

        <RecordSection title="Tax details">
          {details?.gstNumber ? (
            <RecordSummary>
              <RecordFact
                Icon={ReceiptIcon}
                label="GST number"
                value={<span className="font-mono">{details.gstNumber}</span>}
              />
            </RecordSummary>
          ) : (
            <RecordEmpty mark={<ReceiptIcon className="size-5 text-muted-foreground" />}>
              No tax number on file.
            </RecordEmpty>
          )}
        </RecordSection>
      </div>
      <CompanyDetailsDialog />
    </>
  );
};

export default CompanyDetails;
