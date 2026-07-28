import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";

import { StopPropagationWrapper } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

interface PlusEdgeLabelProps {
  edgeId?: string;
}

export const PlusEdgeLabel = ({ edgeId }: PlusEdgeLabelProps) => {
  // Get setOrigin from store

  const { setShowDialog, setOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      setOrigin: state.setOrigin,
    })),
  );

  return (
    <StopPropagationWrapper>
      <Button
        variant={"outline"}
        size={"icon5"}
        className={cn(
          "group z-10 rounded-full opacity-50",
          "hover:bg-primary hover:opacity-100",
          "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
          "nodrag nopan",
        )}
        onClick={(e) => {
          e.preventDefault();
          setOrigin("PlusEdgeLabel", edgeId || "");
          setShowDialog(true);
        }}
      >
        <PlusIcon
          className={cn(
            "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
            "group-hover:text-white group-hover:opacity-100",
            "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
          )}
        />
      </Button>
    </StopPropagationWrapper>
  );
};
