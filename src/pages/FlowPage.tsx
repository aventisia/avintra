import { ActivitySelector } from "@/features/actvity-selector/components/ActivitySelector";
import { FlowControls } from "@/features/flow-controls/FlowControls";
import { ReactFlowExt } from "@/features/react-flow/components/ReactFlowExt";
import { ReactFlowProvider } from "@xyflow/react";

export const FlowPage = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowExt>
        <FlowControls>
          {/* Activity selector to add new node */}
          <ActivitySelector
            origin="FlowControls"
            alignOffset={-5}
            sideOffset={16}
          />
        </FlowControls>
      </ReactFlowExt>
    </ReactFlowProvider>
  );
};
