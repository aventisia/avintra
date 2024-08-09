import { NodeContainer } from "@/components/node-container";
import { cn } from "@/react-toolkit/lib/utils";
import { PopoverTrigger } from "@/react-toolkit/ui/popover/Popover";
import { PlusIcon } from "@heroicons/react/24/outline";
import { PopoverAnchor } from "@radix-ui/react-popover";

export const PlaceholderPlusTrigger = () => {
  return (
    <PopoverTrigger className="group">
      <NodeContainer
        className={cn(
          "flex h-20 items-center justify-center bg-slate-100",
          "border-2 border-dashed border-slate-400/60",
          "group-hover:border-slate-400",
          "group-aria-[expanded=true]:border-slate-400",
        )}
      >
        <PopoverAnchor>
          <PlusIcon className={cn(
            "h-6 w-6 text-slate-400",
            "group-hover:stroke-[2] group-hover:text-primary",
            "group-aria-[expanded=true]:stroke-[2] group-aria-[expanded=true]:text-primary")} />
        </PopoverAnchor>
      </NodeContainer>
    </PopoverTrigger>
  );
};
