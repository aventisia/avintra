import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { FlagIcon, FlagOffIcon } from "lucide-react";

import { useExecutionStore } from "../../stores/execution-log-store";

export const VCBranchStatsButton = () => {
  const { showBranchStats, toggleBranchStats } = useExecutionStore();

  // Render action button
  return (
    <Tooltip
      content={!showBranchStats ? "Show Branch Stats" : "Hide Branch Stats"}
      side="right"
    >
      <Button
        size="icon6"
        className={cn("rounded-md")}
        variant={"ghost"}
        onClick={toggleBranchStats}
      >
        {!showBranchStats ? (
          <FlagIcon className="h-4 w-4 text-[--icon-color]" />
        ) : (
          <FlagOffIcon className="h-4 w-4 text-[--icon-color]" />
        )}{" "}
      </Button>
    </Tooltip>
  );
};
