// components/ChoosePlan.tsx
import { ContentContainer } from "@/features/sign-up/components/account-setup/ContentContainer";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { useShallow } from "zustand/react/shallow";

import { useFetchSubscriptionPlans } from "../../hooks/useFetchSubscriptionPlans";
import { useChoosePlanStore } from "../../stores/choose-plan-store";
import PlanTab from "./PlanTab";
import { PlanTabSkeleton } from "./PlanTabSkeleton";

const PLAN_INTERVALS = ["monthly", "yearly"] as const;

export const ChoosePlan = () => {
  useDocumentTitle("Choose Plan");

  const { data, isLoading } = useFetchSubscriptionPlans();

  const { planType, setPlanType } = useChoosePlanStore(
    useShallow((state) => ({
      planType: state.planType,
      setPlanType: state.setPlanType,
    })),
  );

  return (
    <ContentContainer className="fadeInRTL">
      <Tabs
        value={planType}
        onValueChange={(value) =>
          setPlanType(value as (typeof PLAN_INTERVALS)[number])
        }
        className="w-full"
      >
        <div className="flex items-center justify-between w-full">
          <h2 className="text-4xl font-medium text-foreground">Choose Plan</h2>

          <TabsList>
            {PLAN_INTERVALS.map((interval) => (
              <TabsTrigger key={interval} value={interval}>
                {interval[0].toUpperCase() + interval.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {PLAN_INTERVALS.map((interval) => (
          <TabsContent key={interval} value={interval}>
            {isLoading ? (
              <PlanTabSkeleton />
            ) : (
              data && (
                <PlanTab
                  data={data.data?.filter((p) => p.type != "Enterprise")}
                  planType={interval}
                />
              )
            )}
          </TabsContent>
        ))}
      </Tabs>
    </ContentContainer>
  );
};
