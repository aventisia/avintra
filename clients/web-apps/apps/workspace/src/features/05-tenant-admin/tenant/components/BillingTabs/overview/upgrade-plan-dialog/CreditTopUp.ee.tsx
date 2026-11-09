import { Input, LoadingSpinner } from "@avplatform/ui";
import { RecordSection } from "@avplatform/ui/record-sheet";
import { CoinsIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { currencyToPricePer500Credits } from "@/features/05-tenant-admin/tenant/constants/credit-price-map.ee";
import { formatCurrency } from "@/features/05-tenant-admin/tenant/constants/currency-symbol-map.ee";
import { useFetchCompanyDetails } from "@/features/05-tenant-admin/tenant/hooks/useFetchCompanyDetails.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

import BillingDetails from "./BillingDetails.ee";
import ChargeSummary from "./ChargeSummary.ee";
import CurrencySelect from "./CurrencySelect.ee";

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
    <div className="grid items-start gap-6 md:grid-cols-7">
      <div className="space-y-6 md:col-span-4">
        <RecordSection
          title="Top-up"
          action={
            billingData?.data.country !== "India" && (
              <CurrencySelect value={currency} onChange={setCurrency} className="h-7" />
            )
          }
        >
          <div className="rounded-lg bg-surface ring-1 ring-line">
            <div className="flex flex-wrap items-end gap-3 p-4">
              <label className="min-w-0 flex-1 space-y-1.5">
                <span className="block text-[12.5px] font-medium text-ink">Credits</span>
                <Input
                  placeholder="Enter credits"
                  type="number"
                  max={2354000}
                  step={500}
                  min={0}
                  value={topUp.credits || ""}
                  onChange={handleCreditsChange}
                />
              </label>
              <div className="min-w-0 flex-1 space-y-1.5">
                <span className="block text-[12.5px] font-medium text-ink">Price</span>
                <p className="flex h-8 items-center rounded-md bg-sunken px-3 font-mono text-[13px] tabular-nums text-ink ring-1 ring-inset ring-line">
                  {formatCurrency(((topUp.credits || 0) / 500) * pricePer500Credits, currency)}
                </p>
              </div>
            </div>
            <p className="flex items-center gap-2 border-t border-line bg-sunken/60 px-4 py-2.5 text-[12px] text-ink-2">
              <CoinsIcon className="size-3.5 shrink-0 text-muted-foreground" />
              {formatCurrency(pricePer500Credits ?? 0, currency)} per 500 credits · buy in multiples
              of 500
            </p>
          </div>
        </RecordSection>
        <BillingDetails billingData={billingData?.data} />
      </div>

      <div className="md:col-span-3">
        <ChargeSummary billingData={billingData?.data} isTopUp />
      </div>
    </div>
  );
};

export default CreditTopUp;
