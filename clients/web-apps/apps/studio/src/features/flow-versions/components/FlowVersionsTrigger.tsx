import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PopoverTrigger } from "@avplatform/ui/popover";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ChevronDownIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

import { useFlowsVersionsStore } from "../stores/flow-versions-store";

export const FlowVersionsTrigger = () => {
  // Get store state and actions
  const { versionNumber } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionNumber: state.versionNumber,
    })),
  );

  const isAgentHistory = useIsVersionHistoryRoute();

  const isExecutionLog = useIsExecutionLogsRoute();
  return (
    <Tooltip content={"Versions"}>
      <PopoverTrigger
        disabled={isAgentHistory || isExecutionLog}
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "group h-7 max-w-[15rem] shrink-0 gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80",
        )}
      >
        <span className="min-w-0 truncate">v{versionNumber} </span>
        <ChevronDownIcon className={cn("h-3 w-3 shrink-0 transition-all group-hover:mt-0.5")} />
      </PopoverTrigger>
    </Tooltip>
  );
};
