import { AppRedirectPage } from "@/components/layout/AppRedirectPage";
import { ReactFlowProvider } from "@xyflow/react";
import { lazy, Suspense } from "react";

// Lazy load the ReactFlowViewOnly component.
const ReactFlowViewOnly = lazy(() =>
  import("@/features/version-history/components/ReactFlowViewOnly").then(
    (module) => ({
      default: module.ReactFlowViewOnly,
    }),
  ),
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
