import { ReactFlowProvider } from "@xyflow/react";

import { useActionSelectorData } from "@/features/action-selector/hooks/useActionSelectorData";
import { ReactFlowExt } from "@/features/react-flow/components/ReactFlowExt";

export const FlowPage = () => {
  // Set action selector data
  useActionSelectorData();

  return (
    <ReactFlowProvider>
      <ReactFlowExt />
    </ReactFlowProvider>
  );
};
