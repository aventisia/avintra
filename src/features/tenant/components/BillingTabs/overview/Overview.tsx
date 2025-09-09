import { Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { Check } from "lucide-react";

import { Progress } from "@/features/tenant/shared/Progress";
import { useCancelPlanDialogStore } from "@/features/tenant/store/overview/cancel-plan-dialog-store";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import CalendarOutlineIcon from "../../../assets/calendar-outline-icon.svg";

import CancelPlanDialog from "./CancelPlanDialog";
import UpgradePlanDialog from "./upgrade-plan-dialog/UpgradePlanDialog";

const Overview = () => {
  const { setOpen } = useCancelPlanDialogStore();
  const { setOpen: setUpgradePlanDialogOpen } = useUpgradePlanDialogStore();
  return (
    <>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-lg border p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-lg font-bold">
                Starter{" "}
                <span className="rounded-md bg-muted px-2 py-2 text-2xs font-medium text-muted-foreground">
                  Billed Monthly
                </span>
              </h1>
              <p className="text-sm">
                Individuals or small teams. Start small, gain efficiencies,
                scale easily.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-semibold text-accent-foreground">
                  $00
                </span>{" "}
                /Month
              </p>
            </div>

            <Badge
              className="mt-1 border-black text-sm font-normal"
              variant={"outline"}
            >
              Available Credits:
              <span className="ml-1 font-semibold">4,000</span>
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="border-r">
              <h3 className="font-medium">Plan Includes:</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckMark /> 50 credits/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckMark /> 2 Published agents or AI models
                </li>
                <li className="flex items-center gap-2">
                  <CheckMark /> 1 days of insights & workflow history
                </li>
                <li className="flex items-center gap-2">
                  <CheckMark /> 1 Spaces
                </li>
                <li className="flex items-center gap-2">
                  <CheckMark /> 50 MB storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckMark /> Single users
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Usage:</h3>
              <div className="mt-2 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <p>Published Agents or AI Models</p>
                    <p className="font-light">01 of 02</p>
                  </div>
                  <Progress value={50} className="!w-full bg-accent" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <p>Spaces</p>
                    <p className="font-light">01 of 01</p>
                  </div>
                  <Progress value={100} className="!w-full bg-accent" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <p>Storage</p>
                    <p className="font-light">30 of 50mb</p>
                  </div>
                  <Progress value={60} className="!w-full bg-accent" />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="!mt-10 flex justify-end space-x-4">
            <Button variant={"outline"} onClick={() => setOpen(true)}>
              Cancel Plan
            </Button>
            <Button onClick={() => setUpgradePlanDialogOpen(true)}>
              Upgrade
            </Button>
          </div>
        </div>

        {/* Right hand side */}
        <div className="flex flex-col rounded-lg border pb-6">
          <div className="p-4">
            <p className="text-base font-medium">Next Payment</p>
          </div>
          <Separator />

          <div className="flex-col p-4">
            <div className="flex items-center gap-2 rounded-lg border p-2">
              <img src={CalendarOutlineIcon} alt="" />
              <div className="text-sm">
                <p className="font-medium">on 17 Aug, 2024</p>
                <p className="text-muted-foreground">Due Date</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h2 className="font-medium">Billing Details:</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p>Subscription Fee</p>
                  <p>$24.00</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p>Tax</p>
                  <p>$4.32</p>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <p>Total Amount</p>
                  <p>$28.32</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto px-4">
            <Button
              className="text-primay mt-auto w-full border-primary"
              variant={"outline"}
            >
              Make Payment
            </Button>
          </div>
        </div>
      </div>
      <CancelPlanDialog />
      <UpgradePlanDialog />
    </>
  );
};

export default Overview;

export const CheckMark = () => {
  return (
    <div className="rounded-full bg-green-500 p-[2px]">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
};
