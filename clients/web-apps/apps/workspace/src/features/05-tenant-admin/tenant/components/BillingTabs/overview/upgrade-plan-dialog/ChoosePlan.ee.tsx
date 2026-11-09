import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { RadioGroup } from "@avplatform/ui/radio-group";
import { RecordEmpty, RecordSection } from "@avplatform/ui/record-sheet";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { ArrowLeftIcon, InfoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
} from "@/components/segmented-tabs.constant";
import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails.ee";
import { useFetchSubscriptionPlans } from "@/features/05-tenant-admin/tenant/hooks/useFetchSubscriptionPlans.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type.ee";

import BillingDetails from "./BillingDetails.ee";
import ChargeSummary from "./ChargeSummary.ee";
import CurrencySelect from "./CurrencySelect.ee";
import { PlanItem } from "./choose-plan/PlanItem.ee";

// import TopUp from "./TopUp.ee";

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const EXCLUDED_PLAN_TYPES = ["Starter", "Enterprise"];

const ChoosePlan = ({ isFrequencyChange = false }: { isFrequencyChange?: boolean }) => {
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

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const { data, isLoading } = useFetchSubscriptionPlans(
    `?currency=${currency}&frequency=${planFrequency}&type=Pro`,
  );

  useEffect(() => {
    if (data?.data) {
      const name = data.data.find((item) => item.id == selectedPlan)?.name || "";
      setSelectedPlanName(name);
    }
  }, [data?.data, selectedPlan]);

  useEffect(() => {
    if (!data?.data) return; // If data is not available, exit early

    let queryPlanId = "";

    // Handle selectedPlanName logic if it's defined
    if (selectedPlanName) {
      const planByName = data.data.find((item) => item.name === selectedPlanName);
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

  const { data: billingData, isLoading: isBillingDataLoading } = useFetchCompanyDetails();

  useEffect(() => {
    if (billingData?.data && billingData.data.country == "India" && currency !== "INR") {
      setCurrency("INR");
    }
  }, [billingData?.data]);

  const plans = data?.data?.filter((plan) => !EXCLUDED_PLAN_TYPES.includes(plan.type)) ?? [];

  if (isLoading || isBillingDataLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center space-y-5 px-8 py-10 pt-3">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isFrequencyChange ? (
          planFrequency == "monthly" ? (
            <p className="flex items-center gap-2 rounded-md bg-warn/10 px-3 py-1.5 text-[12.5px] font-medium text-warn ring-1 ring-warn/25">
              <InfoIcon className="size-4 shrink-0" />
              The change to monthly billing will take effect after your current billing cycle ends
            </p>
          ) : (
            <p className="text-[13px] text-ink-2">Switch to yearly billing.</p>
          )
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setChosenPlan(null);
                clearTopUp();
              }}
              variant="ghost"
              size="icon"
              aria-label="Back to deployment options"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <h3 className="text-[15px] font-semibold text-ink">Choose a Pro plan</h3>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!(isFrequencyChange || billingData?.data.country === "India") && (
            <CurrencySelect value={currency} onChange={setCurrency} className="h-8" />
          )}
          <Tabs
            value={planFrequency}
            onValueChange={(value: string) => setPlanFrequency(value as PlanFrequency)}
          >
            <TabsList className={SEGMENTED_TABS_LIST_CLASS}>
              {FREQUENCIES.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  disabled={isFrequencyChange}
                  className={SEGMENTED_TABS_TRIGGER_CLASS}
                  onClick={() => {
                    setSelectedPlan(""); // TODO: Temporary fix to avoid ui bug. @vaibhav fix it properly
                  }}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-7">
        <div className="md:col-span-4">
          <RecordSection title="Plans" count={plans.length}>
            <ScrollArea className="h-[calc(100dvh-30rem)] min-h-64">
              <RadioGroup
                className="gap-2.5 p-0.5"
                value={selectedPlan}
                onValueChange={(val) => {
                  setSelectedPlan(val);
                  setPlanFrequency(planFrequency);
                }}
              >
                {plans.map((plan) => (
                  <PlanItem
                    key={plan.id}
                    plan={plan}
                    planFrequency={planFrequency as PlanFrequency}
                    selectedId={selectedPlan}
                  />
                ))}
              </RadioGroup>
            </ScrollArea>
          </RecordSection>
        </div>

        <div className="space-y-6 md:col-span-3">
          <BillingDetails billingData={billingData?.data} />

          {selectedPlan || topUp.history || topUp.spaces || topUp.storage ? (
            <ChargeSummary
              plan={data?.data.find((val) => val.id == selectedPlan)}
              planFrequency={planFrequency as PlanFrequency}
              billingData={billingData?.data}
              isFrequencyChange={isFrequencyChange}
            />
          ) : (
            <RecordSection title="Charge summary">
              <RecordEmpty>Select a plan to see what you’ll pay.</RecordEmpty>
            </RecordSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;
