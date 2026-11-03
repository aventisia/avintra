import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense } from "react";

import { MachinesTable } from "@/features/03-orchestrator/machines-table/components/MachinesTable";

/**
 * Renders the machine Page component.
 * @returns JSX element representing the MachinesPage component.
 */
export const MachinesPage = () => {
  return (
    <Suspense fallback={<TableCNSkeleton />}>
      <MachinesTable />
    </Suspense>
  );
};
