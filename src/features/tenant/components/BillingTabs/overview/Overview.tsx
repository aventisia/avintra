import { Separator } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";

import { useFetchCurrentPlan } from "@/features/tenant/hooks/useFetchCurrentPlan";
import { useCancelPlanDialogStore } from "@/features/tenant/store/overview/cancel-plan-dialog-store";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import TabLoader from "../TabLoader";

import CancelPlanDialog from "./CancelPlanDialog";
import NextPaymentDetails from "./NextPaymentDetails";
import PlanFeatures from "./PlanFeatures";
import UpgradePlanDialog from "./upgrade-plan-dialog/UpgradePlanDialog";
import UsageDetails from "./UsageDetails";

const Overview = () => {
  const { setOpen } = useCancelPlanDialogStore();
  const { setOpen: setUpgradePlanDialogOpen } = useUpgradePlanDialogStore();

  const { data, isLoading } = useFetchCurrentPlan();

  if (isLoading) return <TabLoader />;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-lg border p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold">
                {data?.data.currentPlan.planName}{" "}
                <span className="rounded-md bg-muted px-2 py-2 text-2xs font-medium capitalize text-muted-foreground">
                  Billed {data?.data.currentPlan.frequency}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                <span className="text-xl font-semibold text-accent-foreground">
                  ${data?.data.currentPlan.price}
                </span>{" "}
                /Month
              </p>
            </div>

            <Badge
              className="border-black text-sm font-normal"
              variant={"outline"}
            >
              Available Credits:
              <span className="ml-1 font-semibold">
                {data?.data.currentPlan.availableCredits.toLocaleString()}
              </span>
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <PlanFeatures features={data?.data.currentPlan.feature} />

            <UsageDetails planUsage={data?.data.currentPlan.usage} />
          </div>

          <Separator />

          <div className="!mt-5 flex justify-end space-x-4">
            <Button variant={"outline"} onClick={() => setOpen(true)}>
              Cancel Plan
            </Button>
            <Button onClick={() => setUpgradePlanDialogOpen(true)}>
              Upgrade
            </Button>
          </div>
        </div>

        {/* Right hand side */}
        <NextPaymentDetails nextPayment={data?.data.nextPayment} />
      </div>
      <CancelPlanDialog />
      <UpgradePlanDialog />
    </>
  );
};

export default Overview;
