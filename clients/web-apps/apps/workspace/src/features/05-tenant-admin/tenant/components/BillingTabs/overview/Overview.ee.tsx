import { Separator } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { InfoIcon, PlusIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { useFetchCurrentPlan } from "@/features/05-tenant-admin/tenant/hooks/useFetchCurrentPlan.ee";
import { useCancelPlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/cancel-plan-dialog-store.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import TabLoader from "../TabLoader.ee";
import BillingFrequency from "./BillingFrequency.ee";
import CancelPlanDialog from "./CancelPlanDialog.ee";
import NextPaymentDetails from "./NextPaymentDetails.ee";
import { PlanFeatures } from "./PlanFeatures.ee";
import { UsageDetails } from "./UsageDetails.ee";
import UpgradePlanDialog from "./upgrade-plan-dialog/UpgradePlanDialog.ee";

const Overview = () => {
  const { setOpen } = useCancelPlanDialogStore();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isStarterPlan = userSession?.planType == "Starter";

  const {
    setOpen: setUpgradePlanDialogOpen,
    setChosenPlan,
    paymentId,
  } = useUpgradePlanDialogStore();

  const isPaymentProcessing = paymentId !== "";

  const { data, isLoading } = useFetchCurrentPlan();

  const currentPlan = data?.data?.currentPlan;

  if (isLoading) return <TabLoader />;

  if (!currentPlan) {
    throw new Error("Current plan data is unavailable");
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-lg border p-6 shadow-sm">
          {isPaymentProcessing ? (
            <div className="flex items-center gap-3 rounded-lg bg-orange-100 px-3 py-2 text-[0.85rem] text-orange-700">
              <InfoIcon className="h-4 w-4 text-orange-400" />
              Your account will be updated shortly.
            </div>
          ) : null}
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{data?.data.currentPlan.planName} </h1>
                {!isStarterPlan && <BillingFrequency currentPlan={data?.data.currentPlan} />}
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="text-xl font-semibold text-accent-foreground">
                  {formatCurrency(currentPlan.price ?? 0, currentPlan?.currency ?? "USD")}
                </span>{" "}
                /{currentPlan.frequency.toLowerCase() == "monthly" ? "month" : "year"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Badge className="border-2 text-sm font-normal" variant={"outline"}>
                <p>
                  Available Credits:
                  <span
                    className={cn(
                      "ml-1 font-semibold",
                      currentPlan.availableCredits < 0 && "text-destructive",
                    )}
                  >
                    {currentPlan.availableCredits.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </Badge>
              {!isStarterPlan && (
                <Tooltip content="Add credits">
                  <Button
                    onClick={() => {
                      setChosenPlan("Credits");
                      setUpgradePlanDialogOpen(true);
                    }}
                    disabled={
                      currentPlan.planName == "Starter" ||
                      isPaymentProcessing ||
                      !currentPlan.isActive
                    }
                    variant={"default"}
                    size={"icon6"}
                    className="rounded-full border-2"
                  >
                    <PlusIcon className="h-5 w-5 font-normal" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex gap-4">
            <PlanFeatures
              className="flex-1"
              frequency={currentPlan.frequency}
              credits={currentPlan.feature.maxCredits}
              publishedItems={currentPlan.feature.maxPublishedItems}
              historyRetentionDays={currentPlan.feature.historyRetentionDays}
              spaces={currentPlan.feature.maxSpaces}
              storageLimitMB={currentPlan.feature.storageLimitMB}
              users={currentPlan.feature.maxUsers}
            />
            <Separator orientation="vertical" className="mx-4 h-[1] w-[1px] bg-border" />
            <UsageDetails className="flex-1" planUsage={currentPlan.usage} />
          </div>

          <Separator />

          <div className="!mt-5 flex justify-end space-x-4">
            <Button variant={"outline"} onClick={() => setOpen(true)}>
              Cancel Plan
            </Button>
            <Button disabled={isPaymentProcessing} onClick={() => setUpgradePlanDialogOpen(true)}>
              Upgrade
            </Button>
          </div>
        </div>

        {/* Right hand side */}
        <NextPaymentDetails plan={data?.data} />
      </div>
      <CancelPlanDialog />
      <UpgradePlanDialog />
    </>
  );
};

export default Overview;
