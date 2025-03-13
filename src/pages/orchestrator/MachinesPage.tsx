import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { lazy, Suspense } from "react";

// Lazy load the MachineTable component.
const MachinesTable = lazy(() =>
  import(
    "@/features/orchestrator/machines-table/components/MachinesTable"
  ).then((module) => ({
    default: module.MachinesTable,
  })),
);

/**
 * Renders the machine Page component.
 * @returns JSX element representing the MachinesPage component.
 */
export const MachinesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <MachinesTable />
    </Suspense>
  );
};
