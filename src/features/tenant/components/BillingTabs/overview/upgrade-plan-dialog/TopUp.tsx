import { Input } from "@aventisia/ui";
import { useShallow } from "zustand/react/shallow";

import { TOP_UP_PRICING } from "@/features/tenant/constants/top-up-pricing";
import { useUpgradePlanDialogStore } from "@/features/tenant/store/overview/upgrade-plan-dialog.store";

const TopUp = () => {
  const { topUp, setTopUp } = useUpgradePlanDialogStore(
    useShallow((state) => ({ topUp: state.topUp, setTopUp: state.setTopUp })),
  );

  return (
    <div className="rounded-lg border">
      <div className="border-b p-3 text-base font-medium">Top-up</div>
      <div className="space-y-3 p-3 text-sm">
        {Object.entries(TOP_UP_PRICING).map(
          ([key, { label, note, unitCost }]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p>{label}</p>
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-32"
                  type="number"
                  step="any"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setTopUp({ [key]: isNaN(value) ? 0 : value });
                  }}
                  value={topUp[key as keyof typeof topUp] || ""}
                />
                <Input
                  value={
                    "$ " +
                    (
                      (topUp[key as keyof typeof topUp] || 0) * unitCost
                    ).toFixed(2)
                  }
                  disabled
                  className="w-32"
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default TopUp;
