import { Button } from "@avplatform/ui/buttons";
import { Label } from "@avplatform/ui/label";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";

import { usePaymentMethodsDialogStore } from "@/features/05-tenant-admin/tenant/store/payment-methods/payment-methods-dialog-store.ee";

import CardIcon from "../../../assets/payment-methods/add-payment-method/card.svg";
import NetBankingIcon from "../../../assets/payment-methods/add-payment-method/net-banking.svg";
import PaypalIcon from "../../../assets/payment-methods/add-payment-method/paypal.svg";
import UPIIcon from "../../../assets/payment-methods/add-payment-method/upi.svg";

const PaymentMethodOptions = () => {
  const { setOpen } = usePaymentMethodsDialogStore();
  return (
    <div className="p-4 pt-2">
      <p className="text-md">Choose payment method type</p>

      <div className="mt-4 rounded-lg border">
        <RadioGroup className="">
          <div className="flex items-center gap-3 border-b p-4">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex w-full items-center justify-between text-md">
              Paypal
              <img src={PaypalIcon} alt="" />
            </Label>
          </div>
          <div className="flex items-center gap-3 border-b p-4">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex w-full items-center justify-between text-md">
              Credit Card / Debit Card
              <img src={CardIcon} alt="" />
            </Label>
          </div>
          <div className="flex items-center gap-3 border-b p-4">
            <RadioGroupItem value="netBanking" id="netBanking" />
            <Label
              htmlFor="netBanking"
              className="flex w-full items-center justify-between text-md"
            >
              Net Banking
              <img src={NetBankingIcon} alt="" />
            </Label>
          </div>
          <div className="flex items-center gap-3 p-4">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex w-full items-center justify-between text-md">
              UPI
              <img src={UPIIcon} alt="" />
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="mt-5 flex justify-end">
        <Button className="px-9 text-md" onClick={() => setOpen(false)}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodOptions;
