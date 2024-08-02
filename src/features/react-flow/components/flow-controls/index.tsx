import { ActivitySelector } from "@/components/activity-selector";
import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";

export const FlowControls = () => {
  return (
    <Panel position="top-left">
      <FCBContainer>
        {/* Activity selector to add new node */}
        <ActivitySelector
          origin="FlowControls"
          alignOffset={-4}
          sideOffset={16}
        />

        {/* Separate from undo and redo */}
        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo */}
        <FCBUndo />

        {/* Redo */}
        <FCBRedo />
      </FCBContainer>
    </Panel>
  );
};
