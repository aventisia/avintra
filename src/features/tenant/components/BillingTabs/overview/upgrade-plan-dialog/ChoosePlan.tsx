import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { RadioGroup } from "@aventisia/ui/radio-group";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useFetchCompanyDetails } from "@/features/tenant/hooks/useFetchCompanyDetails";
import { useFetchSubscriptionPlans } from "@/features/tenant/hooks/useFetchSubscriptionPlans";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";
import { PlanType } from "@/features/tenant/types/plan-type";

import BillingDetails from "./BillingDetails";
import ChargeSummary from "./ChargeSummary";
import { PlanItem } from "./choose-plan/PlanItem";
import TopUp from "./TopUp";

const ChoosePlan = () => {
  const { topUp, clearTopUp, setChosenPlan } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      clearTopUp: state.clearTopUp,
      topUp: state.topUp,
    })),
  );

  const [selectedTab, setSelectedTab] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("");

  const { data, isLoading } = useFetchSubscriptionPlans();

  const { data: billingData, isLoading: isBillingDataLoading } =
    useFetchCompanyDetails();

  if (isLoading || isBillingDataLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center space-y-5 px-8 py-10 pt-3">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setChosenPlan(null);
              clearTopUp();
            }}
            variant={"ghost"}
            className="p-1.5"
            size={"icon9"}
          >
            <ArrowLeft className="mt-[2px] h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Choose Plan</h2>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="rounded-full">
            <TabsTrigger value="monthly" className="rounded-full px-8">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-full px-8">
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <ScrollArea className="h-[calc(100vh-33rem)] p-3">
              <RadioGroup
                value={selectedPlan}
                onValueChange={(val) => {
                  setSelectedPlan(val);
                  setSelectedTab(selectedTab);
                }}
              >
                {data?.data
                  ?.filter((plan) => plan.type != "Enterprise")
                  ?.map((plan) => (
                    <PlanItem
                      key={plan.id}
                      plan={plan}
                      planType={selectedTab as PlanType}
                      selectedId={selectedPlan}
                    />
                  ))}
              </RadioGroup>
            </ScrollArea>
          </div>
          <TopUp planType={selectedTab as PlanType} />
        </div>

        {/* Right hand side */}
        <div className="col-span-3 space-y-4">
          <BillingDetails billingData={billingData?.data} />

          {selectedPlan || topUp.history || topUp.spaces || topUp.storage ? (
            <ChargeSummary
              plan={data?.data.find((val) => val.id == selectedPlan)}
              planType={selectedTab as PlanType}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;

export const CheckMark = () => {
  return (
    <div className="mt-[2px] rounded-full bg-green-500 p-[2px]">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
};
