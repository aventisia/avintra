import { Suspense, lazy } from "react";

// Lazy load the AgentsAssist component.
const AgentsAssist = lazy(() =>
  import("@/features/04-assist/my-agents/components/AgentsAssistTable").then((module) => ({
    default: module.AgentsAssistTable,
  })),
);

/**
 * Renders the AgentsAssistPage component.
 * @returns JSX element representing the AgentsAssistPage component.
 */
export const AgentsAssistPage = () => {
  return (
    <Suspense>
      <AgentsAssist />
    </Suspense>
  );
};
