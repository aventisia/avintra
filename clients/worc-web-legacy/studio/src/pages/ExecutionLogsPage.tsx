import { AppRedirectPage } from "@/components/layout/AppRedirectPage";

import { ReactFlowProvider } from "@xyflow/react";
import { Suspense, lazy } from "react";

// Lazy load the ReactFlowViewOnly component.
const ReactFlowViewOnly = lazy(() =>
  import("@/features/execution-logs/components/ReactFlowViewOnly").then(
    (module) => ({
      default: module.ReactFlowViewOnly,
    }),
  ),
);

/**
 * Renders the ExecutionLogsPage component.
 * @returns JSX element representing the ExecutionLogsPage component.
 */
export const ExecutionLogsPage = () => {
  return (
    <Suspense fallback={<AppRedirectPage />}>
      <ReactFlowProvider>
        <ReactFlowViewOnly />
      </ReactFlowProvider>
    </Suspense>
  );
};
