import { IconTile } from "@avplatform/ui/icon-tile";
import { CreditCardIcon } from "@phosphor-icons/react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { usePaymentMethodsDialogStore } from "@/features/05-tenant-admin/tenant/store/payment-methods/payment-methods-dialog-store.ee";

import PaymentMethodOptions from "./PaymentMethodOptions.ee";

const PaymentMethodsDialog = () => {
  const { isOpen, setOpen } = usePaymentMethodsDialogStore();

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      mark={
        <IconTile Icon={CreditCardIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />
      }
      eyebrow="Billing"
      title="Add payment method"
      footer={
        <>
          <StatusLine tone="idle">Choose a payment method type</StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={() => setOpen(false)}>Cancel</CardDialogButton>
            <CardDialogButton variant="primary" onClick={() => setOpen(false)}>
              Add
            </CardDialogButton>
          </div>
        </>
      }
    >
      <PaymentMethodOptions />
    </CardDialog>
  );
};

export default PaymentMethodsDialog;
