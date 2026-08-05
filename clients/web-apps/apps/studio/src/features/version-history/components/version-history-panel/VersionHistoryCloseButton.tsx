import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { X } from "lucide-react";

import { useCarryParams } from "../../hooks/useForwardQueryParams";

export const VersionHistoryCloseButton = () => {
  const withQueryParams = useCarryParams(["f", "v", "return"]);

  return (
    <>
      <Tooltip content="CLose">
        <a
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: "icon8",
              className: "hover:bg-white/10",
            }),
          )}
          href={import.meta.env.VITE_STUDIO_PATH + withQueryParams("agent")}
        >
          <X className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </a>
      </Tooltip>
    </>
  );
};
