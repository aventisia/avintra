import {
  ActivitySelector,
  FlowControlsTrigger,
  FlowControls,
  ReactFlowExt,
} from "@/features";
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
