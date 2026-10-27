import { LoadingSpinner } from "@avplatform/ui";

import { cn } from "@/ui/lib";

import { useFetchAvailableCredits } from "./useFetchAvailableCredits.ee";

/** Shows the tenant's available credits in the app header. */
const AvailableCredits = () => {
  const { data, isLoading } = useFetchAvailableCredits();
  const availableCredits = data?.data?.availableCredits ?? 0;

  return (
    <span className="inline-flex h-control-sm items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 font-mono text-code tabular-nums text-ink-2">
      {isLoading ? (
        <LoadingSpinner className="size-3 text-muted-foreground" />
      ) : (
        <span className={cn("text-ink", availableCredits < 0 && "text-bad")}>
          {availableCredits.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </span>
      )}
      credits
    </span>
  );
};

export { AvailableCredits };
