import { ReactFlowProvider } from "@xyflow/react";

import { useActionSelectorData } from "@/features/action-selector/hooks/useActionSelectorData.hook";
import { ReactFlowExt } from "@/features/react-flow/components/ReactFlowExt";
import { useRecoverCrashLogs } from "@/hooks/useRecoverCrashLogs";

export const FlowPage = () => {
  // Set action selector data
  useActionSelectorData();

  // Run check for pending logs if any and post them to respective job data
  useRecoverCrashLogs();
  return (
    <ReactFlowProvider>
      <ReactFlowExt />
    </ReactFlowProvider>
  );
};
