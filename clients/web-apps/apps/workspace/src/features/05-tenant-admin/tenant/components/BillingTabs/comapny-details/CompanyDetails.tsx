import { Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { SquarePen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails.ee";
import { useCompanyDetailsDialogStore } from "@/features/05-tenant-admin/tenant/store/company-details/company-details-dialog-store.ee";

import TabLoader from "../TabLoader.ee";
import CompanyDetailsDialog from "./company-details-dialog/CompanyDetailsDialog";

const CompanyDetails = () => {
  const { setOpen } = useCompanyDetailsDialogStore();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({ userSession: state.userSession })),
  );

  const isIndividualUser = userSession?.tenantName == userSession?.email;

  const { data, isLoading } = useFetchCompanyDetails();

  if (isLoading) return <TabLoader />;

  return (
    <>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-heading text-ink">Billing Details</p>
          <Button
            className="flex items-center gap-1.5 bg-selected text-primary-text"
            variant={"ghost"}
            size={"sm"}
            onClick={() => setOpen(true)}
          >
            <SquarePen className="h-4 w-4" /> Edit
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            {/* <p className="text-base font-medium">Company Details</p> */}
            {isIndividualUser ? null : (
              <div className="flex items-center gap-4 text-md">
                <p className="basis-32 text-muted-foreground">Company Name</p>
                <p>{data?.data.organizationName ?? "--"}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-md">
              <p className="basis-32 text-muted-foreground">Billing Email</p>
              <p>{data?.data.billingEmail ?? "--"} </p>
            </div>
            <div className="flex items-center gap-4 text-md">
              <p className="basis-32 text-muted-foreground">Contact</p>
              <p>{data?.data.contactPerson ?? "--"} </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-base font-medium">Billing Address</p>
            <div className="flex items-center gap-4 text-md">
              <p className="basis-32 text-muted-foreground">Primary Address</p>
              <p>
                {[
                  data?.data.addressLine1,
                  data?.data.addressLine2,
                  data?.data.city,
                  data?.data.state,
                  data?.data.country?.replace(/([a-z])([A-Z])/g, "$1 $2"),
                ]
                  .filter(Boolean)
                  .join(", ") + (data?.data.postalCode ? ` - ${data?.data.postalCode}` : "")}
              </p>
            </div>
            <div className="flex items-center gap-4 text-md">
              <p className="basis-32 text-muted-foreground">Country</p>
              <p>{data?.data.country}</p>
            </div>
          </div>

          {data?.data.gstNumber && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-base font-medium">Tax Details</p>

                <div className="flex items-center gap-4 text-md">
                  <p className="basis-32 text-muted-foreground">GST Number</p>
                  <p>{data?.data.gstNumber}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <CompanyDetailsDialog />
    </>
  );
};

export default CompanyDetails;
