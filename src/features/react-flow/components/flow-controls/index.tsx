import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";

export const FlowControls = () => {
  return (
    <Panel position="top-left" onContextMenu={(e) => e.preventDefault()}>
      <FCBContainer>
        {/* Undo */}
        <FCBUndo />

        <Separator orientation="vertical" className="h-6" />

        {/* Redo */}
        <FCBRedo />
      </FCBContainer>
    </Panel>
  );
};
