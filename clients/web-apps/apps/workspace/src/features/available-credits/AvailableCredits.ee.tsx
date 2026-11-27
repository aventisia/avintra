import { LoadingSpinner } from "@avplatform/ui";
import { formatCredits, formatCreditsExact } from "@avplatform/ui/utils";
import { CoinsIcon } from "@phosphor-icons/react";

import { cn } from "@/ui/lib";

import { useFetchAvailableCredits } from "./useFetchAvailableCredits.ee";

/** Sidebar card with the tenant's available credits. */
const AvailableCredits = () => {
  const { data, isLoading } = useFetchAvailableCredits();
  const availableCredits = data?.data?.availableCredits ?? 0;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-1.5 rounded-md border border-line p-2.5 text-[12.5px] text-ink-2">
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
          title={formatCreditsExact(availableCredits)}
        >
          {formatCredits(availableCredits)}
        </b>
      )}
    </div>
  );
};

export { AvailableCredits };
