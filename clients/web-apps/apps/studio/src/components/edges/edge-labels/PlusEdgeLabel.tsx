import { StopPropagationWrapper } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";

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
        variant="outline"
        size="icon5"
        className="nodrag nopan rounded-full"
        onClick={(e) => {
          e.preventDefault();
          setOrigin("PlusEdgeLabel", edgeId || "");
          setShowDialog(true);
        }}
      >
        <PlusIcon weight="bold" className="size-3.5" />
      </Button>
    </StopPropagationWrapper>
  );
};
