import { AgentsTable } from "@/features/03-orchestrator/agents-table/components/AgentsTable";

import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense } from "react";

/**
 * Renders the AgentsTable Page component.
 * @returns JSX element representing the PublishedAgentsPage component.
 */
export const PublishedAgentsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <AgentsTable />
    </Suspense>
  );
};
