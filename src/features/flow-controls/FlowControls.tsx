import { Separator } from "@/react-toolkit/ui/separator";
import { Panel } from "@xyflow/react";
import { FCBContainer } from "./FCBContainer";
import { FCBRedo } from "./FCBRedo";
import { FCBUndo } from "./FCBUndo";

export const FlowControls = ({ children }: React.PropsWithChildren) => {
  return (
    <Panel position="bottom-center">
      <FCBContainer>
        {/* Add activity button */}
        {children}

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
