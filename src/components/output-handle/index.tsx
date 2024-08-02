import { NodeSelector } from "@/components/node-selector";
import { useTrackSelectionStore } from "@/stores/track-selection-store";
import { Position } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { DashedLine } from "./DashedLine";
import { HandleExt } from "./HandleExt";
import { OutputHandleContainer } from "./OutputHandleContainer";

interface OutputHandleProps {
  selected?: boolean;
  dragging?: boolean;
  handlePosition?: Position;
}

export const OutputHandle = ({
  selected = false,
  dragging = false,
  handlePosition = Position.Bottom,
}: OutputHandleProps) => {
  // Get track selection store state
  const { multipleNodesSelected } = useTrackSelectionStore(
    useShallow((state) => ({
      multipleNodesSelected: state.multipleNodesSelected,
    })),
  );

  // Render output handle
  return (
    <>
      <HandleExt handlePosition={handlePosition} />
      {/* Node selector to add new node */}
      {!multipleNodesSelected && selected && !dragging ? (
        <OutputHandleContainer handlePosition={handlePosition}>
          <NodeSelector
            origin="OutputHandle"
            side="right"
            alignOffset={-14}
            sideOffset={16}
          />
          <DashedLine handlePosition={handlePosition} />
        </OutputHandleContainer>
      ) : null}
    </>
  );
};
