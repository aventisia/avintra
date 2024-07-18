import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { Separator } from "@/react-toolkit/components/ui";
import { FCBUndo } from "./FCBUndo";
import { FCBRedo } from "./FCBRedo";
import { FCBAddNode } from "./FCBAddNode";

export const FlowControls = () => {
  return (
    <Panel position="bottom-center">
      <FCBContainer>
        {/* Add activity button */}
        <FCBAddNode />

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
