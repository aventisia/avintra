import { LoadingSpinner } from "@avplatform/ui";
import { CoinsIcon } from "@phosphor-icons/react";

import { cn } from "@/ui/lib";

import { useFetchAvailableCredits } from "./useFetchAvailableCredits.ee";

const COMPACT_SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi"];

/** Keeps up to 2 decimals and at most 4 whole digits, scaling 5+ digits to K, M, B... */
const formatCredits = (credits: number) => {
  let value = credits;
  let tier = 0;
  while (Math.abs(Math.round(value * 100) / 100) >= 10_000 && tier < COMPACT_SUFFIXES.length - 1) {
    value /= 1000;
    tier++;
  }
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${COMPACT_SUFFIXES[tier]}`;
};

/** Sidebar card with the tenant's available credits. */
const AvailableCredits = () => {
  const { data, isLoading } = useFetchAvailableCredits();
  const availableCredits = data?.data?.availableCredits ?? 0;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-1.5 gap-y-2 rounded-md border border-line p-2.5 text-[12.5px] text-ink-2">
      <span className="inline-flex items-center gap-1.5">
        <CoinsIcon className="size-3.5 shrink-0 text-muted-foreground" />
        Credits left
      </span>
      {isLoading ? (
        <LoadingSpinner className="size-3 text-muted-foreground" />
      ) : (
        <b
          className={cn(
            "font-mono font-medium tabular-nums text-ink",
            availableCredits < 0 && "text-bad",
          )}
          title={availableCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        >
          {formatCredits(availableCredits)}
        </b>
      )}
      {/* IMPORTANT NOTE: the credits API has no granted total, so the bar only shows credits remaining or not. */}
      <span className="col-span-full h-1 rounded-full bg-line">
        <span
          className={cn("block h-full rounded-full bg-primary", availableCredits <= 0 && "w-0")}
        />
      </span>
    </div>
  );
};

export { AvailableCredits };
