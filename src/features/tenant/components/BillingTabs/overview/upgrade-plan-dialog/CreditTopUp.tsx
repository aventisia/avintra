import { Input, LoadingSpinner } from "@aventisia/ui";
import { useShallow } from "zustand/react/shallow";

import { currencyToPricePer500Credits } from "@/features/tenant/constants/credit-price-map";
import { formatCurrency } from "@/features/tenant/constants/currency-symbol-map";
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

  // Round up to the nearest step (500)
  const roundUpToStep = (value: number, step: number): number => {
    return Math.ceil(value / step) * step;
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

  // Handle changes to the credit input field
  const handleCreditsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0;

    // Ensure value is within the valid range (0 to 2,352,000) and round up to nearest 500
    value = Math.max(0, Math.min(value, 2354000)); // Enforce the max/min constraints
    value = roundUpToStep(value, 500); // Round up to nearest 500

    setTopUp({ credits: value });
  };

  const handleBlur = () => {
    // Round up the value on blur (just in case the user didn't fully follow the multiples of 500 rule)
    const rounded = roundUpToStep(topUp.credits || 0, 500);
    setTopUp({ credits: rounded });
  };

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
                    {formatCurrency(pricePer500Credits ?? 0, currency)} = 500
                    credits
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter credits"
                    className="w-32"
                    type="number"
                    max={2354000}
                    step={500}
                    min={0}
                    value={topUp.credits || ""}
                    onChange={handleCreditsChange}
                    onBlur={handleBlur}
                  />
                  <Input
                    value={formatCurrency(
                      ((topUp.credits || 0) / 500) * pricePer500Credits,
                      currency,
                    )}
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
