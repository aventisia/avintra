import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { PlusIcon } from "@heroicons/react/24/outline";
import { EdgeLabelRenderer } from "@xyflow/react";

interface AddNodeFromEdgeProps {
  labelX?: number;
  labelY?: number;
}

export const AddNodeFromEdge = ({ labelX, labelY }: AddNodeFromEdgeProps) => {
  return (
    <EdgeLabelRenderer>
      <PopoverTrigger
        style={{
          position: "absolute",
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: "all",
        }}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon6" }),
          "group z-10 rounded-full opacity-50",
          "hover:bg-primary hover:opacity-100",
          "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
          "nodrag nopan",
        )}
      >
        <PlusIcon
          className={cn(
            "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
            "group-hover:text-white group-hover:opacity-100",
            "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
          )}
        />
      </PopoverTrigger>
    </EdgeLabelRenderer>
  );
};
