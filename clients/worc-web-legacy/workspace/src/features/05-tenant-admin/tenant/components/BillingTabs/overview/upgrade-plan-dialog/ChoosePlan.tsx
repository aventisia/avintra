import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails";
import { useFetchSubscriptionPlans } from "@/features/05-tenant-admin/tenant/hooks/useFetchSubscriptionPlans";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type";

import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { RadioGroup } from "@aventisia/ui/radio-group";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ArrowLeft, Check, InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import BillingDetails from "./BillingDetails";
import ChargeSummary from "./ChargeSummary";
import CurrencySelect from "./CurrencySelect";
import { PlanItem } from "./choose-plan/PlanItem";

// import TopUp from "./TopUp";

const ChoosePlan = ({
  isFrequencyChange = false,
}: {
  isFrequencyChange?: boolean;
}) => {
  const {
    topUp,
    clearTopUp,
    setChosenPlan,
    currency,
    setCurrency,
    planFrequency,
    setPlanFrequency,
  } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      clearTopUp: state.clearTopUp,
      topUp: state.topUp,
      currency: state.currency,
      setCurrency: state.setCurrency,
      planFrequency: state.planFrequency,
      setPlanFrequency: state.setPlanFrequency,
    })),
  );

  //Plans to exclude from upgrade plan list
  const excludePlans = ["Starter", "Enterprise"];

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const { data, isLoading } = useFetchSubscriptionPlans(
    `?currency=${currency}&frequency=${planFrequency}&type=Pro`,
  );

  useEffect(() => {
    if (data?.data) {
      const name =
        data.data.find((item) => item.id == selectedPlan)?.name || "";
      setSelectedPlanName(name);
    }
  }, [data?.data, selectedPlan]);

  useEffect(() => {
    if (!data?.data) return; // If data is not available, exit early

    let queryPlanId = "";

    // Handle selectedPlanName logic if it's defined
    if (selectedPlanName) {
      const planByName = data.data.find(
        (item) => item.name === selectedPlanName,
      );
      if (planByName) {
        queryPlanId = planByName.id;
      }
    }

    // Handle the currency-based logic if frequency change is true
    if (isFrequencyChange && !queryPlanId) {
      const planByCurrency = data.data.find(
        (item) => item.currency === currency && item.type == "Pro",
      );
      if (planByCurrency) {
        queryPlanId = planByCurrency.id;
      }
    }

    // If a valid planId was found, update state
    setSelectedPlan(queryPlanId || "");
  }, [selectedPlanName, currency, data?.data, isFrequencyChange]);

  const { data: billingData, isLoading: isBillingDataLoading } =
    useFetchCompanyDetails();

  useEffect(() => {
    if (
      billingData?.data &&
      billingData.data.country == "India" &&
      currency !== "INR"
    ) {
      setCurrency("INR");
    }
  }, [billingData?.data]);

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
          {isFrequencyChange ? (
            planFrequency == "monthly" && (
              <div className="flex items-center gap-3 rounded-lg bg-orange-100 px-3 py-2 text-[0.85rem] text-orange-600">
                <InfoIcon className="h-4 w-4 text-orange-400" />
                The change to monthly billing will take effect after your
                current billing cycle ends
              </div>
            )
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!(isFrequencyChange || billingData?.data.country === "India") && (
            <CurrencySelect value={currency} onChange={setCurrency} />
          )}{" "}
          <Tabs
            value={planFrequency}
            onValueChange={(value: string) =>
              setPlanFrequency(value as PlanFrequency)
            }
          >
            <TabsList className="rounded-full">
              <TabsTrigger
                disabled={isFrequencyChange}
                value="monthly"
                className="rounded-full px-8"
                onClick={() => {
                  setSelectedPlan(""); // TODO: Temporary fix to avoid ui bug. @vaibhav fix it properly
                }}
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                disabled={isFrequencyChange}
                value="yearly"
                className="rounded-full px-8"
                onClick={() => {
                  setSelectedPlan(""); // TODO: Temporary fix to avoid ui bug. @vaibhav fix it properly
                }}
              >
                Yearly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <ScrollArea className="h-[calc(100vh-22rem)] p-3">
              <RadioGroup
                value={selectedPlan}
                onValueChange={(val) => {
                  setSelectedPlan(val);
                  setPlanFrequency(planFrequency);
                }}
              >
                {data?.data
                  ?.filter((plan) => !excludePlans.includes(plan.type))
                  ?.map((plan) => (
                    <PlanItem
                      key={plan.id}
                      plan={plan}
                      planFrequency={planFrequency as PlanFrequency}
                      selectedId={selectedPlan}
                    />
                  ))}
              </RadioGroup>
            </ScrollArea>
          </div>
          {/* <TopUp planFrequency={planFrequency as PlanFrequency} /> */}
        </div>

        {/* Right hand side */}
        <div className="col-span-3 space-y-4">
          <BillingDetails billingData={billingData?.data} />

          {selectedPlan || topUp.history || topUp.spaces || topUp.storage ? (
            <ChargeSummary
              plan={data?.data.find((val) => val.id == selectedPlan)}
              planFrequency={planFrequency as PlanFrequency}
              billingData={billingData?.data}
              isFrequencyChange={isFrequencyChange}
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
