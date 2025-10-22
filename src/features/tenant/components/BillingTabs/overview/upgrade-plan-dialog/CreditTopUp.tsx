import { Input, LoadingSpinner } from "@aventisia/ui";
import { useShallow } from "zustand/react/shallow";

import { currencyToPricePer500Credits } from "@/features/tenant/constants/credit-price-map";
import { currencySymbols } from "@/features/tenant/constants/currency-symbol-map";
import { useFetchCompanyDetails } from "@/features/tenant/hooks/useFetchCompanyDetails";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

import BillingDetails from "./BillingDetails";
import ChargeSummary from "./ChargeSummary";
import CurrencySelect from "./CurrencySelect";

const CreditTopUp = () => {
  const { topUp, setTopUp, currency, setCurrency } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      topUp: state.topUp,
      setTopUp: state.setTopUp,
      currency: state.currency,
      setCurrency: state.setCurrency,
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

  const pricePer500Credits = currencyToPricePer500Credits[currency] ?? 1;

  return (
    <div className="space-y-4 p-4 pt-2">
      <div className="grid grid-cols-7 gap-4">
        {/* Left Side */}
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b p-3">
              <div className="text-base font-medium">Top-up</div>
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
            <div className="space-y-3 p-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p>Credits</p>
                  <p className="text-sm text-muted-foreground">
                    {currencySymbols[currency]}
                    {pricePer500Credits} = 500 credits
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter credits"
                    className="w-32"
                    type="number"
                    step={500}
                    min={0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setTopUp({ credits: isNaN(value) ? 0 : value });
                    }}
                    onBlur={() => {
                      const rounded = roundToStep(topUp.credits || 0, 500);
                      setTopUp({ credits: isNaN(rounded) ? 0 : rounded });
                    }}
                    value={topUp.credits || ""}
                  />
                  <Input
                    value={
                      currencySymbols[currency] +
                      (
                        ((topUp.credits || 0) / 500) *
                        pricePer500Credits
                      ).toFixed(2)
                    }
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
        <div className="col-span-3 space-y-4">
          {<ChargeSummary billingData={billingData?.data} isTopUp />}
        </div>
      </div>
    </div>
  );
};

export default CreditTopUp;
