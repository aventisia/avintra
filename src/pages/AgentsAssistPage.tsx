import { AgentsAssistSkeleton } from "@/features/agents-assist/components/AgentsAssistSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the AgentsAssist component.
const AgentsAssist = lazy(() =>
  import("@/features/agents-assist/components/index").then((module) => ({
    default: module.AgentsAssist,
  })),
);

/**
 * Renders the AgentsAssistPage component.
 * @returns JSX element representing the AgentsAssistPage component.
 */
export const AgentsAssistPage = () => {
  return (
    <Suspense fallback={<AgentsAssistSkeleton />}>
      <AgentsAssist />
    </Suspense>
  );
};
