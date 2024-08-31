import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { PopoverTrigger } from "@/react-toolkit/ui/popover";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

interface PlusEdgeLabelProps {
  edgeId?: string;
}

export const PlusEdgeLabel = ({ edgeId }: PlusEdgeLabelProps) => {
  // Get setOrigin from store
  const { setOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      setOrigin: state.setOrigin,
    })),
  );

  return (
    <StopPropagationWrapper>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon5" }),
          "group z-10 rounded-full opacity-50",
          "hover:bg-primary hover:opacity-100",
          "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
          "nodrag nopan",
        )}
        onClick={() => setOrigin("PlusEdgeLabel", edgeId || "")}
      >
        <PlusIcon
          className={cn(
            "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
            "group-hover:text-white group-hover:opacity-100",
            "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
          )}
        />
      </PopoverTrigger>
    </StopPropagationWrapper>
  );
};
