import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense } from "react";

import { AgentsTable } from "@/features/orchestrator/agents-table/components/AgentsTable";
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
