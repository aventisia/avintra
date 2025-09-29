import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { Label } from "@aventisia/ui/label";
import { cn } from "@aventisia/ui/lib";
import { RadioGroup, RadioGroupItem } from "@aventisia/ui/radio-group";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Tabs, TabsList, TabsTrigger } from "@aventisia/ui/tabs";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import { useFetchSubscriptionPlans } from "@/features/tenant/hooks/useFetchSubscriptionPlans";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

const ProPlan = () => {
  const { data, isLoading } = useFetchSubscriptionPlans("Pro");
  const { setChosenPlan } = useUpgradePlanDialogStore();
  const [selectedTab, setSelectedTab] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center space-y-5 px-8 py-10 pt-3">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-8 py-10 pt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setChosenPlan("")}
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

      <div className="mt-6 grid grid-cols-[2fr_1fr] gap-4">
        <div className="rounded-lg border p-2">
          <ScrollArea className="h-[calc(100vh-20.2rem)]">
            <RadioGroup
              className="space-y-1 px-3 py-2"
              value={selectedPlan}
              onValueChange={setSelectedPlan}
            >
              {data?.data.map((item) => {
                return (
                  <div>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4",
                        selectedPlan === item.id && "rounded-b-none",
                      )}
                      key={item.id}
                    >
                      <RadioGroupItem value={item.id} id={item.id} />
                      <div className="flex w-full items-end justify-between">
                        <Label htmlFor={item.id} className="text-base">
                          {item.name}
                          <div className="mt-1 text-sm">
                            <span className="text-base">
                              {selectedTab === "monthly"
                                ? item.maxCredits
                                : item.maxCredits * 12}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {" "}
                              credits/
                              {selectedTab === "monthly" ? "month" : "year"}
                            </span>
                          </div>
                        </Label>

                        <p className="text-muted-foreground">
                          <span className="text-accent-foreground">
                            $
                            {selectedTab === "monthly"
                              ? item.monthlyPrice
                              : item.yearlyPrice}
                          </span>{" "}
                          {selectedTab === "monthly" ? "/Month" : "/Year"}
                        </p>
                      </div>
                    </div>
                    {selectedPlan === item.id && (
                      <div className="rounded-lg rounded-t-none border border-t-0 p-4">
                        <p className="text-base font-semibold">
                          Plan Includes:
                        </p>
                        <ul className="mt-2 space-y-1 text-md">
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>
                              {item.maxCredits} credits/
                              {selectedTab === "monthly" ? "month" : "year"}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>
                              {item.maxPublishedItems} Published Agents or AI
                              Models
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>
                              {item.historyRetentionDays} days of insights &
                              workflow history
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>{item.maxSpaces} Worc Spaces</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>
                              {item.storageLimitMB < 0
                                ? "Unlimited Storage"
                                : `${item.storageLimitMB} MB storage`}{" "}
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckMark />
                            <span>
                              {item.maxUsers < 0
                                ? "Unlimited Users"
                                : `${item.maxUsers} Users`}
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </ScrollArea>
        </div>

        {/* Right hand side */}
        <div className="space-y-4">
          <div className="rounded-lg border p-3">
            <p className="font-semibold">Billing Details:</p>
            <Separator className="mt-2" />
            <div className="space-y-2 py-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Company Name</p>
                <p>KeenThemes</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Country</p>
                <p>India</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">GST Number</p>
                <p>NL123456789B01</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <p className="font-semibold">Charge Summary:</p>
            <Separator className="mt-2" />
            <div className="space-y-2 py-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Subscription Fee</p>
                <p>$24.00</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Tax</p>
                <p>$4.32</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Amount Due</p>
                <p>$28.32</p>
              </div>
            </div>

            <Button className="mt-2 w-full">Make Payment</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProPlan;

export const CheckMark = () => {
  return (
    <div className="mt-[2px] rounded-full bg-green-500 p-[2px]">
      <Check className="h-3 w-3 text-white" />
    </div>
  );
};
