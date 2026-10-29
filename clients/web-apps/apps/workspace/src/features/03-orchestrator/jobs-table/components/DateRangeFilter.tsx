import { Calendar, UpgradeDialog } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { useUserSessionStore } from "@avplatform/ui/stores";
import {
  differenceInCalendarDays,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DateRange, paramsToRange, rangeToParams, useDateRangePickerStore } from "..";

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL;
const UPGRADE_PRICING_URL = MARKETING_URL ? `${MARKETING_URL}/pricing` : undefined;

export const DateRangeFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dateRange, setDateRange } = useDateRangePickerStore();

  const [showRangePicker, setShowRangePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isCommunityDeployment = useUserSessionStore(
    (state) => state.userSession?.deploymentType === "Community",
  );
  const isStarterPlan = useUserSessionStore((state) => state.userSession?.planType === "Starter");
  const useTenantOverview = isStarterPlan && !isCommunityDeployment;

  const hydratedRef = useRef(false);
  const today = useMemo(() => new Date(), []);

  const historyLimitDays = isCommunityDeployment || isStarterPlan ? 1 : undefined;

  const exceedsHistory = useCallback(
    (range?: DateRange) =>
      !!range?.from &&
      historyLimitDays != null &&
      differenceInCalendarDays(today, range.from) > historyLimitDays - 1,
    [historyLimitDays, today],
  );

  const isCurrentTab = searchParams.get("t") == "Current";

  /* -------------------------------
     Default last 7 days
  -------------------------------- */

  const defaultRange = useMemo<DateRange>(
    () => ({
      from: subDays(today, Math.min(7, historyLimitDays ?? 7) - 1),
      to: today,
    }),
    [historyLimitDays, today],
  );

  // Sync date range selection with URL param on mount
  useEffect(() => {
    if (hydratedRef.current) return;

    const urlRange = paramsToRange(searchParams.get("from"), searchParams.get("to"));

    const outOfRange = !!urlRange && exceedsHistory(urlRange);
    const finalRange = outOfRange ? defaultRange : (urlRange ?? defaultRange);

    // Set store + local picker state
    setDateRange(finalRange);
    setSelectedRange(finalRange);

    // If URL missing or out of reach, push the applied range to URL
    if (!urlRange || outOfRange) {
      const params = Object.fromEntries(searchParams.entries());
      Object.assign(params, rangeToParams(finalRange));
      setSearchParams(params);
    }

    hydratedRef.current = true;
  }, [defaultRange, exceedsHistory, searchParams, setSearchParams, setDateRange]);

  const applyRange = useCallback(
    (range?: DateRange) => {
      if (!range) return;

      setDateRange(range);

      const params = Object.fromEntries(searchParams.entries());
      Object.assign(params, rangeToParams(range));
      setSearchParams(params);
    },
    [searchParams, setSearchParams, setDateRange],
  );

  //  Presets
  const presets = [
    { label: "Today", value: "today" },
    { label: "Week to date", value: "week" },
    { label: "Month to date", value: "month" },
    {
      label: historyLimitDays === 1 ? "Last 1 day" : "Last 7 days",
      value: historyLimitDays === 1 ? 1 : 7,
    },
    { label: "Last 15 days", value: 15 },
    { label: "Last 30 days", value: 30 },
  ];

  const getPresetRange = (preset: (typeof presets)[number]) => {
    let from: Date;

    if (typeof preset.value === "string") {
      if (preset.value === "today") from = today;
      else if (preset.value === "week") from = startOfWeek(today, { weekStartsOn: 0 });
      else from = startOfMonth(today);
    } else {
      from = subDays(today, preset.value - 1);
    }

    return { from, to: today };
  };

  const isSameRange = (r1?: DateRange, r2?: DateRange) =>
    r1 && r2 && isSameDay(r1.from!, r2.from!) && isSameDay(r1.to!, r2.to!);

  if (!selectedRange) return null;

  return (
    <>
      <Popover
        open={showRangePicker}
        onOpenChange={(open) => {
          if (open && historyLimitDays === 1) {
            setShowUpgrade(true);
            return;
          }
          setShowRangePicker(open);
        }}
      >
        <PopoverTrigger asChild disabled={isCurrentTab}>
          <Button disabled={isCurrentTab} variant="outline">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            {format(selectedRange.from!, "MMM d, yyyy")} -{" "}
            {format(selectedRange.to!, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="mr-4 px-4">
          <div className="grid grid-cols-[auto_1fr] gap-6">
            {/* Presets */}
            <div className="flex flex-col gap-2 border-r pr-4 pt-4">
              {presets.map((preset) => {
                const range = getPresetRange(preset);
                const isSelected = isSameRange(selectedRange, range);

                return (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => {
                      if (exceedsHistory(range)) {
                        setShowRangePicker(false);
                        setShowUpgrade(true);
                        return;
                      }
                      setSelectedRange(range);
                    }}
                    className={`justify-start border-none shadow-none ${
                      isSelected ? "bg-selected text-primary-text" : ""
                    }`}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div>
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={selectedRange}
                onSelect={setSelectedRange}
              />

              <div className="flex justify-end gap-2 pb-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRangePicker(false);
                    setSelectedRange(dateRange);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowRangePicker(false);
                    if (exceedsHistory(selectedRange)) {
                      setShowUpgrade(true);
                      return;
                    }
                    applyRange(selectedRange);
                  }}
                >
                  {exceedsHistory(selectedRange) ? "Upgrade" : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        pricingUrl={useTenantOverview ? undefined : UPGRADE_PRICING_URL}
        upgradePath={useTenantOverview ? "/tenant/overview" : undefined}
      />
    </>
  );
};
