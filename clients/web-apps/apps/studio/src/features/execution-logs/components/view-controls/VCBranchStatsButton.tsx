import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { FlagBannerFoldIcon, FlagIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useExecutionStore } from "../../stores/execution-log-store";

export const VCBranchStatsButton = () => {
  const { showBranchStats, toggleBranchStats } = useExecutionStore(
    useShallow((state) => ({
      showBranchStats: state.showBranchStats,
      toggleBranchStats: state.toggleBranchStats,
    })),
  );

  // Render action button
  return (
    <Tooltip content={!showBranchStats ? "Show branch stats" : "Hide branch stats"} side="right">
      <Button
        size="icon6"
        className={cn("rounded-md")}
        variant={"ghost"}
        onClick={toggleBranchStats}
      >
        {!showBranchStats ? (
          <FlagIcon className="h-4 w-4 text-[--icon-color]" />
        ) : (
          <FlagBannerFoldIcon className="h-4 w-4 text-[--icon-color]" />
        )}{" "}
      </Button>
    </Tooltip>
  );
};
