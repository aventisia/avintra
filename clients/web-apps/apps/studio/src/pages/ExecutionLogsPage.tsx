import { ReactFlowProvider } from "@xyflow/react";
import { Suspense, lazy } from "react";

import { AppRedirectPage } from "@/components/layout/AppRedirectPage";

import { loadExecutionLogsView } from "./studio-view-loaders";

const ReactFlowViewOnly = lazy(() =>
  loadExecutionLogsView().then((module) => ({ default: module.ReactFlowViewOnly })),
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
