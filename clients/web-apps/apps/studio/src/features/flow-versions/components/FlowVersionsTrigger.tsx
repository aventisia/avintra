import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { useFlowsVersionsStore } from "../stores/flow-versions-store";

export const FlowVersionsTrigger = () => {
  // Get store state and actions
  const { versionNumber } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionNumber: state.versionNumber,
    })),
  );
  const isVersionTransitioning = useCurrentFlowStore((state) => state.isVersionTransitioning);

  const isAgentHistory = useIsVersionHistoryRoute();

  const isExecutionLog = useIsExecutionLogsRoute();
  return (
    <Tooltip content={"Versions"}>
      <PopoverTrigger
        disabled={isAgentHistory || isExecutionLog || isVersionTransitioning}
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "group h-7 max-w-[15rem] shrink-0 gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80",
        )}
      >
        <span className="min-w-0 truncate">v{versionNumber}</span>
        {isVersionTransitioning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ChevronDownIcon className="h-3 w-3 shrink-0 transition-all group-hover:mt-0.5" />
        )}
      </PopoverTrigger>
    </Tooltip>
  );
};
