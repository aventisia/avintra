import { MachinesTable } from "@/features/03-orchestrator/machines-table/components/MachinesTable";

import { DataTableSkeleton } from "@aventisia/ui/data-table";
import { Suspense } from "react";

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
