import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { X } from "lucide-react";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryCloseButton = () => {
  const withQueryParams = useCarryParams(["f", "v"]);

  return (
    <>
      <Tooltip content="CLose">
        <a
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "icon8",
            }),
          )}
          href={
            import.meta.env.VITE_AGENTBUILDER_PATH + withQueryParams("agent")
          }
        >
          <X className="h-4 w-4" />
        </a>
      </Tooltip>
    </>
  );
};
