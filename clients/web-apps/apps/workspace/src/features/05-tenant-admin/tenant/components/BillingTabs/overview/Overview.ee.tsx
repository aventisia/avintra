import { Button } from "@avplatform/ui/buttons";
import { RecordSection } from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { PlusIcon } from "@phosphor-icons/react";

import { useFetchCurrentPlan } from "@/features/05-tenant-admin/tenant/hooks/useFetchCurrentPlan.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import TabLoader from "../TabLoader.ee";
import CancelPlanDialog from "./CancelPlanDialog.ee";
import { CreditsCard } from "./CreditsCard.ee";
import NextPaymentDetails from "./NextPaymentDetails.ee";
import { PlanAllowances } from "./PlanAllowances.ee";
import { PlanHero } from "./PlanHero.ee";
import { UsageDetails } from "./UsageDetails.ee";
import UpgradePlanDialog from "./upgrade-plan-dialog/UpgradePlanDialog.ee";

const Overview = () => {
  const isStarterPlan = useUserSessionStore((state) => state.userSession?.planType == "Starter");
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
      <div className="space-y-6">
        <PlanHero
          plan={currentPlan}
          isStarterPlan={isStarterPlan}
          isPaymentProcessing={isPaymentProcessing}
        />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RecordSection title="Usage">
              <UsageDetails plan={currentPlan} />
            </RecordSection>
            <RecordSection title="Included in your plan">
              <PlanAllowances plan={currentPlan} />
            </RecordSection>
          </div>

          <div className="space-y-6">
            <RecordSection
              title="Credits"
              action={
                !isStarterPlan && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="gap-1"
                    disabled={
                      currentPlan.planName == "Starter" ||
                      isPaymentProcessing ||
                      !currentPlan.isActive
                    }
                    onClick={() => {
                      setChosenPlan("Credits");
                      setUpgradePlanDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="size-3.5" />
                    Add credits
                  </Button>
                )
              }
            >
              <CreditsCard plan={currentPlan} />
            </RecordSection>
            <RecordSection title="Next payment">
              <NextPaymentDetails plan={data.data} />
            </RecordSection>
          </div>
        </div>
      </div>
      <CancelPlanDialog expiresOn={currentPlan.expiredOn} />
      <UpgradePlanDialog />
    </>
  );
};

export default Overview;
