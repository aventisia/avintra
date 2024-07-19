import { FCBContainer, FCBRedo, FCBUndo } from "@/features/flow-controls";
import { Panel } from "@xyflow/react";
import { Separator } from "@/react-toolkit/components/ui";

interface FlowControlsProps {
  children: React.ReactNode;
}

export const FlowControls = ({ children }: FlowControlsProps) => {
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
