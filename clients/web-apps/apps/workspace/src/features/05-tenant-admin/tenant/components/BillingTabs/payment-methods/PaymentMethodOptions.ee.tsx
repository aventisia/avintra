import { Label } from "@avplatform/ui/label";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";

import CardIcon from "../../../assets/payment-methods/add-payment-method/card.svg";
import NetBankingIcon from "../../../assets/payment-methods/add-payment-method/net-banking.svg";
import PaypalIcon from "../../../assets/payment-methods/add-payment-method/paypal.svg";
import UPIIcon from "../../../assets/payment-methods/add-payment-method/upi.svg";

const PAYMENT_METHOD_OPTIONS = [
  { value: "paypal", label: "Paypal", icon: PaypalIcon },
  { value: "card", label: "Credit Card / Debit Card", icon: CardIcon },
  { value: "netBanking", label: "Net banking", icon: NetBankingIcon },
  { value: "upi", label: "UPI", icon: UPIIcon },
];

const PaymentMethodOptions = () => (
  <RadioGroup className="gap-0 divide-y divide-line overflow-hidden rounded-md ring-1 ring-line">
    {PAYMENT_METHOD_OPTIONS.map(({ value, label, icon }) => (
      <div key={value} className="flex items-center gap-3 bg-popover px-3.5 py-3">
        <RadioGroupItem value={value} id={value} />
        <Label
          htmlFor={value}
          className="flex w-full items-center justify-between text-[13px] font-medium text-ink"
        >
          {label}
          <img src={icon} alt="" />
        </Label>
      </div>
    ))}
  </RadioGroup>
);

export default PaymentMethodOptions;
