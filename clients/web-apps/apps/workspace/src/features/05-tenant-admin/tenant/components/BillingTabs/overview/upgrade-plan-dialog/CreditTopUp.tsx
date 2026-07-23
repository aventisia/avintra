import { Input, LoadingSpinner } from "@avplatform/ui";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { currencyToPricePer500Credits } from "@/features/05-tenant-admin/tenant/constants/credit-price-map";
import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map";
import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store";

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

  const { data: billingData, isLoading: isBillingDataLoading } = useFetchCompanyDetails();

  useEffect(() => {
    if (billingData?.data && billingData.data.country == "India" && currency !== "INR") {
      setCurrency("INR");
    }
  }, [billingData?.data]);

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
    const raw = e.target.value;

    // allow empty while typing
    if (raw === "") {
      setTopUp({ credits: 0 });
      return;
    }

    let value = Number(raw);
    if (isNaN(value)) return;

    value = Math.max(0, Math.min(value, 2354000));

    setTopUp({ credits: value });
  };

  return (
    <div className="space-y-4 p-4 pt-2">
      <div className="grid grid-cols-7 gap-4">
        {/* Left Side */}
        <div className="col-span-4 space-y-4">
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b p-3">
              <div className="text-base font-medium">Top-up</div>
              {billingData?.data.country !== "India" && (
                <CurrencySelect value={currency} onChange={setCurrency} />
              )}
            </div>
            <div className="space-y-3 p-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p>Credits</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(pricePer500Credits ?? 0, currency)} = 500 credits
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Credits must be in multiples of 500
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
