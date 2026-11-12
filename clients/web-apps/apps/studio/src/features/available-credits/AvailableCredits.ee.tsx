import { LoadingSpinner } from "@avplatform/ui";
import { Tooltip } from "@avplatform/ui/tooltip";
import { formatCredits, formatCreditsExact } from "@avplatform/ui/utils";
import { CoinsIcon } from "@phosphor-icons/react";

import { cn } from "@/ui/lib";

import { useFetchAvailableCredits } from "./useFetchAvailableCredits.ee";

/** Shows the tenant's available credits in the app header. */
const AvailableCredits = () => {
  const { data, isLoading } = useFetchAvailableCredits();
  const availableCredits = data?.data?.availableCredits ?? 0;

  return (
    <Tooltip content={`Available credits: ${formatCreditsExact(availableCredits)}`}>
      <span className="hidden items-center gap-1.5 whitespace-nowrap text-[12.5px] md:inline-flex">
        <CoinsIcon className="size-3.5 shrink-0 text-muted-foreground" />
        {isLoading ? (
          <LoadingSpinner className="size-3 text-muted-foreground" />
        ) : (
          <b
            className={cn(
              "font-mono font-medium tabular-nums text-ink",
              availableCredits < 0 && "text-bad",
            )}
          >
            {formatCredits(availableCredits)}
          </b>
        )}
      </span>
    </Tooltip>
  );
};

export { AvailableCredits };
