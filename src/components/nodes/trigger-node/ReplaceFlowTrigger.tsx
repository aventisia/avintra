import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { NodeToolbar, Position } from "@xyflow/react";

export const ReplaceFlowTrigger = () => {
  return (
    <NodeToolbar offset={5} position={Position.Top}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon6" }),
          "z-10 rounded-full opacity-80 hover:opacity-100",
          "aria-[expanded=true]:opacity-100",
        )}
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
      </PopoverTrigger>
    </NodeToolbar>
  );
};
