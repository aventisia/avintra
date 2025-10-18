import { Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { dateFormatter } from "@aventisia/ui/utils";

import { currencySymbols } from "@/features/tenant/constants/currency-symbol-map";
import { NextPaymentDto } from "@/features/tenant/dtos/current-plan-dto";

import CalendarOutlineIcon from "../../../assets/calendar-outline-icon.svg";

interface NextPaymentDetailsProps {
  nextPayment: NextPaymentDto | undefined;
  currency?: string;
}

const NextPaymentDetails = ({
  nextPayment,
  currency = "USD",
}: NextPaymentDetailsProps) => {
  return (
    <div className="flex flex-col rounded-lg border pb-6">
      <div className="p-4">
        <p className="text-base font-medium">Next Payment</p>
      </div>
      <Separator />

      <div className="flex-col p-4">
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <img src={CalendarOutlineIcon} alt="" />
          <div className="text-sm">
            <p className="text-muted-foreground">Due Date</p>
            <p className="font-medium">
              {dateFormatter(nextPayment?.dueDate || new Date())}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h2 className="font-medium">Billing Details:</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p>Subscription Fee</p>
              <p>
                {currencySymbols[currency] +
                  (nextPayment?.subscriptionFee ?? 0)}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <p>Tax</p>
              <p>${nextPayment?.tax ?? 0}</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <p>Total Amount</p>
              <p>${nextPayment?.totalAmount ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4">
        <Button
          className="mt-auto w-full border-primary text-primary"
          variant={"outline"}
        >
          Make Payment
        </Button>
      </div>
    </div>
  );
};

export default NextPaymentDetails;
