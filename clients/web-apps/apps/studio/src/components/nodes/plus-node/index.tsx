import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { ActionSelectorOriginType } from "@/types/action-selector-origin-type";

import { PlusNodeTrigger } from "./PlusNodeTrigger";

export const PlusNode = memo(({ id, type, targetPosition, sourcePosition }: NodeProps) => {
  // Get setOrigin from store
  const { setShowDialog, setOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      setOrigin: state.setOrigin,
    })),
  );

  return (
    <>
      <PlusNodeTrigger
        onClick={() => {
          setOrigin(type as ActionSelectorOriginType, id);
          setShowDialog(true);
        }}
      />

      <InputHandle position={targetPosition} className="opacity-0" />

      <OutputHandle position={sourcePosition} className="opacity-0" />
    </>
  );
});

PlusNode.displayName = "PlusNode";
