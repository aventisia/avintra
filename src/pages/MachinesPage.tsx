import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the ProjectsTable component.
const MachinesTable = lazy(() =>
  import("@/features/orchestrator/machine-table/components/MachinesTable").then(
    (module) => ({
      default: module.MachineTable,
    }),
  ),
);

/**
 * Renders the ProjectsPage component.
 * @returns JSX element representing the ProjectsPage component.
 */
export const MachinesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <MachinesTable />
    </Suspense>
  );
};
