import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

// Lazy load the SupportTicketsTable component.
const SupportTicketsTable = lazy(() =>
  import("@/features/05-tenant-admin/support-tickets-table/components/SupportTicketsTable").then(
    (module) => ({
      default: module.SupportTicketsTable,
    }),
  ),
);

/**
 * Renders the SupportTicketsPage component.
 * @returns JSX element representing the SupportTicketsPage component.
 */
export const SupportTicketsPage = () => {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <SupportTicketsTable />
    </Suspense>
  );
};
