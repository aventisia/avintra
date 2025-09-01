import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { SquarePen } from "lucide-react";

import { useCompanyDetailsDialogStore } from "@/features/tenant/store/company-details/company-details-dialog-store";

import CompanyDetailsDialog from "./company-details-dialog/CompanyDetailsDialog";

const CompanyDetails = () => {
  const { setOpen } = useCompanyDetailsDialogStore();
  return (
    <>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-base font-medium">Billing Details</p>
          <Button
            className="flex items-center gap-1.5 bg-primary-50 text-primary"
            variant={"ghost"}
            size={"sm"}
            onClick={() => setOpen(true)}
          >
            <SquarePen className="h-4 w-4" /> Edit
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-base font-medium">Company Details</p>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">Company Name</p>
              <p>Aventisia Technologies Pvt. Ltd.</p>
            </div>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">Billing Email</p>
              <p>accounts@aventisia.com</p>
            </div>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">Contact</p>
              <p>Gaurav Kumar</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-base font-medium">Billing Address</p>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">Primary Address</p>
              <p>
                Office No 297, Global Business Hub, Kharadi, Pune, Maharashtra,
                India - 411014
              </p>
            </div>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">Country</p>
              <p>India</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-base font-medium">Tax Details</p>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">PO Number</p>
              <p>000876675</p>
            </div>
            <div className="text-md flex items-center gap-4">
              <p className="basis-32 text-muted-foreground">GST Number</p>
              <p>NL123456789B01</p>
            </div>
          </div>
        </div>
      </div>
      <CompanyDetailsDialog />
    </>
  );
};

export default CompanyDetails;
