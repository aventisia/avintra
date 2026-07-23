import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense } from "react";

import { MachinesTable } from "@/features/03-orchestrator/machines-table/components/MachinesTable";

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
