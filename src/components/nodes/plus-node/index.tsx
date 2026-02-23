import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { PlusNodeTrigger } from "./PlusNodeTrigger";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { NodeSelector } from "@/features/action-selector/components";
import { ActionSelectorOriginType } from "@/types/action-selector-origin-type";
import { memo } from "react";

export const PlusNode = memo(
  ({ id, type, targetPosition, sourcePosition }: NodeProps) => {
    // Get setOrigin from store
    const { setOrigin } = useNodeSelectorStore(
      useShallow((state) => ({
        setOrigin: state.setOrigin,
      })),
    );

    return (
      <>
        <NodeSelector>
          <PlusNodeTrigger
            onClick={() => setOrigin(type as ActionSelectorOriginType, id)}
          />
        </NodeSelector>

        <InputHandle position={targetPosition} className="opacity-0" />

        <OutputHandle position={sourcePosition} className="opacity-0" />
      </>
    );
  },
);

PlusNode.displayName = "PlusNode";
