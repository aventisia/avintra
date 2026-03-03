import { Tooltip } from "@aventisia/ui/tooltip";
import { buttonVariants } from "@aventisia/ui/buttons";
import { useCarryParams } from "../../hooks/useForwardQueryParams";
import { cn } from "@aventisia/ui/lib";
import { X } from "lucide-react";

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
              className: "hover:bg-white/10",
            }),
          )}
          href={
            import.meta.env.VITE_AGENTBUILDER_PATH + withQueryParams("agent")
          }
        >
          <X className="h-[1.1rem] w-[1.1rem] text-white/80" />
        </a>
      </Tooltip>
    </>
  );
};
