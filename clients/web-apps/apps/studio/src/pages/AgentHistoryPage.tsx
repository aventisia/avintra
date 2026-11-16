import { ReactFlowProvider } from "@xyflow/react";
import { Suspense, lazy } from "react";

import { AppRedirectPage } from "@/components/layout/AppRedirectPage";

import { loadAgentHistoryView } from "./studio-view-loaders";

const ReactFlowViewOnly = lazy(() =>
  loadAgentHistoryView().then((module) => ({ default: module.ReactFlowViewOnly })),
);

/**
 * Renders the AgentHistoryPage component.
 * @returns JSX element representing the AgentHistoryPage component.
 */
export const AgentHistoryPage = () => {
  return (
    <Suspense fallback={<AppRedirectPage />}>
      <ReactFlowProvider>
        <ReactFlowViewOnly />
      </ReactFlowProvider>
    </Suspense>
  );
};
