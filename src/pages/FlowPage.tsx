import { ReactFlowExt } from "@/features/react-flow/components/ReactFlowExt";
import { ReactFlowProvider } from "@xyflow/react";

export const FlowPage = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowExt />
    </ReactFlowProvider>
  );
};
