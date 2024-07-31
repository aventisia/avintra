import { ActivitySelector } from "@/features/actvity-selector/components/ActivitySelector";
import { Position } from "@xyflow/react";
import { DashedLine } from "./DashedLine";
import { HandleExt } from "./HandleExt";
import { OutputHandleContainer } from "./OutputHandleContainer";

interface OutputHandleProps {
  selected?: boolean;
  handlePosition?: Position;
}

export const OutputHandle = ({
  selected = false,
  handlePosition = Position.Bottom,
}: OutputHandleProps) => {
  return (
    <OutputHandleContainer handlePosition={handlePosition}>
      <HandleExt handlePosition={handlePosition} />

      {selected ? (
        <>
          {/* Activity selector to add new node */}
          <ActivitySelector
            origin="OutputHandle"
            side="right"
            alignOffset={-14}
            sideOffset={16}
          />
          <DashedLine handlePosition={handlePosition} />
        </>
      ) : null}
    </OutputHandleContainer>
  );
};
