import {
  ActivitySelector,
  FlowControlsTrigger,
} from "@/features/actvity-selector";
import { FlowControls } from "@/features/flow-controls";
import { ReactFlowExt } from "@/features/react-flow";
import { ReactFlowProvider } from "@xyflow/react";

export const FlowPage = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowExt>
        <FlowControls>
          {/* Activity selector to add new node */}
          <ActivitySelector
            alignOffset={-5}
            sideOffset={16}
            trigger={<FlowControlsTrigger />}
          />
        </FlowControls>
      </ReactFlowExt>
    </ReactFlowProvider>
  );
};
