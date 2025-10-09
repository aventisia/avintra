import { Input, LoadingSpinner } from "@aventisia/ui";
import { useShallow } from "zustand/react/shallow";

import { useFetchCompanyDetails } from "@/features/tenant/hooks/useFetchCompanyDetails";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import BillingDetails from "./BillingDetails";
import ChargeSummary from "./ChargeSummary";

const CreditTopUp = () => {
  const { topUp, setTopUp } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      topUp: state.topUp,
      setTopUp: state.setTopUp,
    })),
  );

  // Round the value to the nearest step
  const roundToStep = (value: number, step: number): number => {
    return Math.round(value / step) * step;
  };

  const { data: billingData, isLoading: isBillingDataLoading } =
    useFetchCompanyDetails();

  if (isBillingDataLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center space-y-5 px-8 py-10 pt-3">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pt-2">
      <div className="grid grid-cols-7 gap-4">
        {/* Right hand side */}
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <div className="border-b p-3 text-base font-medium">Top-up</div>
            <div className="space-y-3 p-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p>Credits</p>
                  <p className="text-sm text-muted-foreground">
                    {"$1 = 500 credits"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Enter credits`}
                    className="w-32"
                    type="number"
                    step={500}
                    min={0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setTopUp({ credits: isNaN(value) ? 0 : value });
                    }}
                    onBlur={() => {
                      const roundedValue = roundToStep(topUp.credits || 0, 500);
                      setTopUp({
                        credits: isNaN(roundedValue) ? 0 : roundedValue,
                      });
                    }}
                    value={topUp.credits || ""}
                  />
                  <Input
                    value={"$ " + ((topUp.credits || 0) * (1 / 500)).toFixed(2)}
                    disabled
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </div>
          <BillingDetails billingData={billingData?.data} />
        </div>

        {/* Right hand side */}
        <div className="col-span-3 space-y-4">{<ChargeSummary />}</div>
      </div>
    </div>
  );
};

export default CreditTopUp;
