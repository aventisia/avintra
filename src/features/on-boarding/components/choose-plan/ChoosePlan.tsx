import { ContentContainer } from "@/features/sign-up/components/account-setup/ContentContainer";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFetchSubscriptionPlans } from "../../hooks/useFetchSubscriptionPlans";
import { useChoosePlanStore } from "../../stores/choose-plan-store";
import { PlanFrequency } from "../../types/plan-type";
import PlanTab from "./PlanTab";
import { PlanTabSkeleton } from "./PlanTabSkeleton";

const PLAN_INTERVALS = ["monthly", "yearly"] as const;

export const ChoosePlan = () => {
  useDocumentTitle("Choose Plan");

  const [searchParams] = useSearchParams();

  const plan = searchParams.get("plan") || "";
  const paramCurrency = searchParams.get("currency") || "";
  const frequency = searchParams.get("frequency") || "";

  const { planFrequency, currency, setCurrency, setPlanId, setPlanFrequency } =
    useChoosePlanStore(
      useShallow((state) => ({
        planFrequency: state.planFrequency,
        setPlanFrequency: state.setPlanFrequency,
        planId: state.planId,
        setPlanId: state.setPlanId,
        currency: state.currency,
        setCurrency: state.setCurrency,
      })),
    );

  const { data, isLoading } = useFetchSubscriptionPlans(
    `?currency=${currency}&frequency=${planFrequency}`,
  );

  useEffect(() => {
    if (frequency) {
      setPlanFrequency(frequency.toLowerCase() as PlanFrequency);
    }
    if (paramCurrency) {
      setCurrency(paramCurrency.toUpperCase());
    }
  }, [paramCurrency, frequency]);

  useEffect(() => {
    if (plan && data?.data) {
      const queryPlanId =
        data.data.find((item) => item.name.toLowerCase() == plan.toLowerCase())
          ?.id || "";
      setPlanId(queryPlanId);
    }
  }, [data?.data, plan, setPlanId]);

  return (
    <ContentContainer className="fadeInRTL">
      <Tabs
        value={planFrequency}
        onValueChange={(value) =>
          setPlanFrequency(value as (typeof PLAN_INTERVALS)[number])
        }
        className="w-full"
      >
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-medium text-foreground">Choose Plan</h2>
          <div className="flex gap-2 items-center">
            <Select
              defaultValue="USD"
              value={currency}
              onValueChange={(value: string) => setCurrency(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
            <TabsList>
              {PLAN_INTERVALS.map((interval) => (
                <TabsTrigger key={interval} value={interval}>
                  {interval[0].toUpperCase() + interval.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {PLAN_INTERVALS.map((interval) => (
          <TabsContent key={interval} value={interval}>
            {isLoading ? (
              <PlanTabSkeleton />
            ) : (
              data && (
                <PlanTab
                  data={data.data?.filter((p) => p.type != "Enterprise")}
                  planFrequency={interval}
                />
              )
            )}
          </TabsContent>
        ))}
      </Tabs>
    </ContentContainer>
  );
};
