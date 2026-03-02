import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { PopoverTrigger } from "@aventisia/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";
import { useShallow } from "zustand/react/shallow";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";

export const FlowVersionsTrigger = () => {
  // Get store state and actions
  const { versionNumber } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionNumber: state.versionNumber,
    })),
  );

  const isAgentHistory = useIsVersionHistoryRoute();

  return (
    <Tooltip content={"Versions"}>
      <PopoverTrigger
        disabled={isAgentHistory}
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "group flex h-7 max-w-[15rem] gap-2 rounded-full bg-white/10 pl-3 pr-2.5 font-bold text-white/80 hover:bg-white/20 hover:text-white/80",
        )}
      >
        <span>v{versionNumber} </span>
        <ChevronDownIcon
          className={cn("h-3 w-3 min-w-3 transition-all group-hover:mt-0.5")}
        />
      </PopoverTrigger>
    </Tooltip>
  );
};
