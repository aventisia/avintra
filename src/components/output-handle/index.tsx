import { ActivitySelector } from "@/components/activity-selector";
import { Position } from "@xyflow/react";
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
  return (
    <>
      <HandleExt handlePosition={handlePosition} />
      {/* Activity selector to add new node */}
      {selected && !dragging ? (
        <OutputHandleContainer handlePosition={handlePosition}>
          <ActivitySelector
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
