import { ReactFlowProvider } from "@xyflow/react";
import { Suspense, lazy } from "react";

import { AppRedirectPage } from "@/components/layout/AppRedirectPage";
import { useActionSelectorData } from "@/features/action-selector/hooks/useActionSelectorData.hook";
import { loadAgentHistoryView } from "@/features/version-history";

const ReactFlowViewOnly = lazy(() =>
  loadAgentHistoryView().then((module) => ({ default: module.ReactFlowViewOnly })),
);

/**
 * Renders the AgentHistoryPage component.
 * @returns JSX element representing the AgentHistoryPage component.
 */
export const AgentHistoryPage = () => {
  // The read-only settings header resolves the subtitle and docs link from the catalog too.
  useActionSelectorData();

  return (
    <Suspense fallback={<AppRedirectPage />}>
      <ReactFlowProvider>
        <ReactFlowViewOnly />
      </ReactFlowProvider>
    </Suspense>
  );
};
