import { DotSeparator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Plus, SquarePen, Trash2 } from "lucide-react";

import { usePaymentMethodsDialogStore } from "@/features/tenant/store/payment-methods/payment-methods-dialog-store";

import PaypalIcon from "../../../assets/payment-methods/paypal.svg";
import VisaIcon from "../../../assets/payment-methods/visa.svg";

import PaymentMethodsDialog from "./PaymentMethodsDialog";

const PaymentMethods = () => {
  const { setOpen } = usePaymentMethodsDialogStore();

  return (
    <>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-base font-medium">Payment Methods</p>
          <Button
            className="flex items-center gap-1 bg-primary-50 text-primary"
            variant={"ghost"}
            size={"sm"}
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Payment Method
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-4">
            <div className="flex items-center gap-4">
              <img src={VisaIcon} alt="" />
              <div>
                <p className="text-md font-medium">Jason Tatum</p>
                <p className="flex items-center text-sm text-muted-foreground">
                  Ending 3604 <DotSeparator /> Expires 12/2026{" "}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="mr-2 rounded-sm bg-black px-2.5 text-sm font-medium text-white">
                Primary
              </p>
              <Button variant={"ghost"} size={"icon5"}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button variant={"ghost"} size={"icon5"}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-4">
            <div className="flex items-center gap-4">
              <img src={VisaIcon} alt="" />
              <div>
                <p className="text-md font-medium">Jason Tatum</p>
                <p className="flex items-center text-sm text-muted-foreground">
                  Ending 3604 <DotSeparator /> Expires 12/2026{" "}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="mr-2 rounded-sm bg-transparent px-2.5 text-sm font-medium text-primary">
                Set as Primary
              </p>
              <Button variant={"ghost"} size={"icon5"}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button variant={"ghost"} size={"icon5"}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-4">
            <div className="flex items-center gap-4">
              <img src={PaypalIcon} alt="" />
              <div>
                <p className="text-md font-medium">Jason Tatum</p>
                <p className="flex items-center text-sm text-muted-foreground">
                  Ending 3604 <DotSeparator /> Expires 12/2026{" "}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="mr-2 rounded-sm bg-transparent px-2.5 text-sm font-medium text-primary">
                Set as Primary
              </p>
              <Button variant={"ghost"} size={"icon5"}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button variant={"ghost"} size={"icon5"}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PaymentMethodsDialog />
    </>
  );
};

export default PaymentMethods;
