import { Input } from "@avplatform/ui";
import { useShallow } from "zustand/react/shallow";

import { ADD_ON_PRICING } from "@/features/05-tenant-admin/tenant/constants/add-on-pricing.ee";
import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";
import { PlanFrequency } from "@/features/05-tenant-admin/tenant/types/plan-type.ee";

const TopUp = ({ planFrequency }: { planFrequency: PlanFrequency }) => {
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

  // Adjust the cost based on the selected plan type (monthly/yearly)
  const adjustCostForFrequency = (
    unitCost: { monthly: number; yearly: number },
    frequency: PlanFrequency,
  ): number => {
    return frequency === "monthly" ? unitCost.monthly : unitCost.yearly;
  };

  return (
    <div className="rounded-lg border">
      <div className="border-b p-4 text-base font-medium">Add-on</div>
      <div className="space-y-3 p-3 text-sm">
        {Object.entries(ADD_ON_PRICING).map(([key, { label, note, unitCost, step }]) => {
          // Adjust the unit cost based on the selected frequency
          const adjustedUnitCost = adjustCostForFrequency(unitCost, planFrequency);

          // Select the appropriate note based on the plan type
          const adjustedNote = note[planFrequency];

          return (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p>{label}</p>
                <p className="text-sm text-muted-foreground">{adjustedNote}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-32"
                  type="number"
                  step={step}
                  min={0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setTopUp({ [key]: isNaN(value) ? 0 : value });
                  }}
                  onBlur={() => {
                    const roundedValue = roundToStep(topUp[key as keyof typeof topUp] || 0, step);
                    setTopUp({
                      [key]: isNaN(roundedValue) ? 0 : roundedValue,
                    });
                  }}
                  value={topUp[key as keyof typeof topUp] || ""}
                />
                <Input
                  value={
                    "$ " + ((topUp[key as keyof typeof topUp] || 0) * adjustedUnitCost).toFixed(2)
                  }
                  disabled
                  className="w-32"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopUp;
