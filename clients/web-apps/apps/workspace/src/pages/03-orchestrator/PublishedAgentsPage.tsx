import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense } from "react";

import { AgentsTable } from "@/features/03-orchestrator/agents-table/components/AgentsTable";

/**
 * Renders the AgentsTable Page component.
 * @returns JSX element representing the PublishedAgentsPage component.
 */
export const PublishedAgentsPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <AgentsTable />
    </Suspense>
  );
};
