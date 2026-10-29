import { buttonVariants } from "@avplatform/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
} from "@avplatform/ui/dialog";
import { X } from "lucide-react";

import { usePaymentMethodsDialogStore } from "@/features/05-tenant-admin/tenant/store/payment-methods/payment-methods-dialog-store.ee";

import PaymentMethodOptions from "./PaymentMethodOptions.ee";

const PaymentMethodsDialog = () => {
  const { isOpen, setOpen } = usePaymentMethodsDialogStore();
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[35rem] space-y-2 px-1">
        <DialogHeader className="border-b px-4 py-4 pb-2">
          <DialogTitle className="justify-between">
            <h2 className="text-lg font-semibold">Add Payment Method</h2>
            <DialogPrimitive.Close className={buttonVariants({ variant: "ghost", size: "icon8" })}>
              <X className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Add Payment Method</span>
            </DialogPrimitive.Close>
          </DialogTitle>
        </DialogHeader>

        <PaymentMethodOptions />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodsDialog;
