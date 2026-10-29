import { Separator } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { needsDeferredProfile } from "@avplatform/ui/utils";
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

const ACCOUNTS_CHECKOUT_PATH = import.meta.env.VITE_ACCOUNTS_PATH + "onboarding?plan=";

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

  const openUpgrade = () => {
    if (isStarterPlan && needsDeferredProfile(userSession)) {
      window.location.href = ACCOUNTS_CHECKOUT_PATH;
      return;
    }
    setUpgradePlanDialogOpen(true);
  };

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
        <div className="space-y-4 rounded-lg border bg-surface p-6">
          {isPaymentProcessing ? (
            <div className="flex items-center gap-3 rounded-lg bg-warn/10 px-3 py-2 text-[0.85rem] text-warn">
              <InfoIcon className="h-4 w-4 text-warn" />
              Your account will be updated shortly.
            </div>
          ) : null}
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-heading">{data?.data.currentPlan.planName} </h1>
                {!isStarterPlan && <BillingFrequency currentPlan={data?.data.currentPlan} />}
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-xl font-semibold tabular-nums text-ink">
                  {formatCurrency(currentPlan.price ?? 0, currentPlan?.currency ?? "USD")}
                </span>{" "}
                /{currentPlan.frequency.toLowerCase() == "monthly" ? "month" : "year"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <span className="inline-flex h-control-sm items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 font-mono text-code tabular-nums text-ink-2">
                <span className={cn("text-ink", currentPlan.availableCredits < 0 && "text-bad")}>
                  {currentPlan.availableCredits.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </span>
                credits
              </span>
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
                    className="rounded-md border-2"
                    aria-label="Add credits"
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
              Cancel plan
            </Button>
            <Button disabled={isPaymentProcessing} onClick={openUpgrade}>
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
