import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { CircleNotchIcon, SparkleIcon } from "@phosphor-icons/react";

import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";

import ViewerButton from "./ViewerButton";

export function TestTabExecuteButton({
  isPending,
  onExecute,
}: {
  isPending: boolean;
  onExecute: () => void;
}) {
  return (
    <DCPTabsFooterWrapper className="justify-between">
      <ViewerButton />
      <Button
        onClick={onExecute}
        size="sm"
        type="button"
        disabled={isPending}
        className={cn("relative overflow-hidden transition-all duration-[120ms] ease-out")}
      >
        {isPending ? (
          <>
            <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
            Executing
          </>
        ) : (
          <>
            <SparkleIcon className="mr-2 h-4 w-4 text-primary-foreground" />
            Execute
          </>
        )}
        {isPending && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
        )}
      </Button>
    </DCPTabsFooterWrapper>
  );
}
