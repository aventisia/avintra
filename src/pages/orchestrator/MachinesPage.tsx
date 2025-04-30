import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";

import { Suspense, lazy } from "react";

// Lazy load the MachineTable component.
const MachineTabs = lazy(() =>
  import("@/features/orchestrator/machines-table/components/MachineTabs").then(
    (module) => ({
      default: module.MachineTabs,
    }),
  ),
);

/**
 * Renders the machine Page component.
 * @returns JSX element representing the MachinesPage component.
 */
export const MachinesPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <MachineTabs />
    </Suspense>
  );
};
